import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { auth } from "~/lib/auth.server";
import { pageMeta } from "~/utils/seo";
import { db } from "~/lib/db.server";
import { sendMessageNotificationEmail } from "~/lib/email.server";
import { RateLimitService, MessageService } from "~/lib/rate-limit.server";
import { getClientIP } from "~/utils/request.server";

export const meta: MetaFunction = () => pageMeta.messages();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await auth.api.getSession({ headers: request.headers });
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const limit = 20;

  // 1. 获取已批准的消息（分页）
  const query = cursor
    ? `SELECT * FROM messages WHERE status = 'approved' AND id < ? ORDER BY created_at DESC LIMIT ?`
    : `SELECT * FROM messages WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?`;

  const approvedMessages = cursor
    ? db.prepare(query).all(parseInt(cursor, 10), limit)
    : db.prepare(query).all(limit);

  // 2. 获取当前用户自己的待审核消息（仅自己可见）
  let userPendingMessages: any[] = [];
  if (session?.user) {
    userPendingMessages = db.prepare(`
      SELECT * FROM messages
      WHERE status = 'pending' AND user_id = ?
      ORDER BY created_at DESC
    `).all(session.user.id);
  }

  // 3. 判断是否有更多数据
  const hasMore = approvedMessages.length === limit;
  const nextCursor = hasMore ? (approvedMessages[approvedMessages.length - 1] as any).id : null;

  return json({
    messages: approvedMessages,
    userPendingMessages,
    defaultAvatar: "https://whylookthis.wangjiajun.asia/taobao.jfif",
    nextCursor,
    hasMore,
  }, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // 1. 身份验证
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return json({ error: "请先登录" }, { status: 401 });
  }

  // 2. IP 限流检查（第一道防线）- 防止单 IP 暴力刷屏
  const clientIP = getClientIP(request);
  console.log("[Message] Submission attempt:", {
    userId: session.user.id,
    username: session.user.name || session.user.email,
    ip: clientIP,
    timestamp: new Date().toISOString(),
  });

  try {
    const ipAllowed = RateLimitService.checkIPRateLimit(clientIP);
    if (!ipAllowed) {
      console.warn("[RateLimit] IP blocked:", { ip: clientIP, userId: session.user.id });
      return json(
        { error: "⚠️ 操作过于频繁，请一小时后再试（IP 限制：20次/小时）" },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("[RateLimit] Database error during IP check, allowing request:", error);
    // 降级策略：数据库故障时跳过 IP 限流，避免影响正常用户
  }

  // 3. 用户冷却时间检查（第二道防线）- 防止连续提交
  try {
    const userAllowed = MessageService.checkUserRateLimit(session.user.id);
    if (!userAllowed) {
      console.warn("[RateLimit] User cooldown active:", { userId: session.user.id });
      return json(
        { error: "⏱️ 请等待 60 秒后再发送下一条留言" },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("[RateLimit] Database error during cooldown check, allowing request:", error);
    // 降级策略：数据库故障时跳过冷却检查
  }

  // 4. 每日留言上限检查（第三道防线）- 防止单账号刷屏
  const DAILY_LIMIT = 10;
  try {
    const dailyAllowed = MessageService.checkDailyLimit(session.user.id, DAILY_LIMIT);
    if (!dailyAllowed) {
      const todayCount = MessageService.getUserTodayCount(session.user.id);
      console.warn("[RateLimit] Daily limit reached:", { userId: session.user.id, count: todayCount });
      return json(
        { error: `📝 您今天的留言次数已达上限（${DAILY_LIMIT}条/天），明天再来吧~` },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error("[RateLimit] Database error during daily limit check, allowing request:", error);
    // 降级策略：数据库故障时跳过每日上限检查
  }

  // 5. 内容验证
  const formData = await request.formData();
  const content = formData.get("content") as string;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return json({ error: "留言内容不能为空" }, { status: 400 });
  }

  if (content.trim().length > 500) {
    return json({ error: "留言内容不能超过500字符" }, { status: 400 });
  }

  try {
    // 6. 插入消息到数据库
    const stmt = db.prepare(`
      INSERT INTO messages (user_id, username, content, status, created_at)
      VALUES (?, ?, ?, 'pending', datetime('now'))
    `);

    const username = session.user.name || session.user.email?.split('@')[0] || 'User';
    const result = stmt.run(
      session.user.id,
      username,
      content.trim()
    );

    // 7. 更新限流计数（重要：放在数据库插入成功后）
    try {
      MessageService.incrementUserTodayCount(session.user.id);
    } catch (error) {
      console.error("[RateLimit] Failed to increment daily count:", error);
      // 计数失败不影响留言提交，仅记录日志
    }

    // 8. 异步发送邮件通知给管理员（不阻塞用户响应）
    sendMessageNotificationEmail({
      username,
      userEmail: session.user.email || null,
      content: content.trim(),
      messageId: Number(result.lastInsertRowid),
    }).catch(err => {
      // 邮件发送失败不影响留言提交，只记录错误
      console.error('[Message] Failed to send notification email:', err);
    });

    console.log("[Message] Submission successful:", {
      userId: session.user.id,
      messageId: result.lastInsertRowid,
    });

    return json({ success: "✅ 留言提交成功！您的留言正在审核中，审核通过后将显示在留言板上。" });
  } catch (error) {
    console.error("[Message] Error creating message:", error);
    return json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
};
