import { Resend } from "resend";

// 创建 Resend 客户端
const resend = new Resend(process.env.RESEND_API_KEY);

// 验证邮件配置
if (process.env.RESEND_API_KEY) {
  console.log("[Email] Resend API configured successfully");
} else {
  console.warn("[Email] RESEND_API_KEY not configured");
}

/**
 * 发送Magic Link登录邮件
 */
export async function sendMagicLinkEmail(email: string, magicLinkUrl: string) {
  // 如果在开发环境且未配置邮件，只打印到控制台
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                     🔐 MAGIC LINK (开发模式)                      ║
╠═══════════════════════════════════════════════════════════════════╣
║  收件人: ${email.padEnd(57)}║
║  登录链接:                                                        ║
║  ${magicLinkUrl.padEnd(61)}║
║                                                                   ║
║  提示: 复制上面的链接到浏览器即可登录                              ║
║  提示: 链接5分钟内有效                                            ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
    return { success: true };
  }

  try {
    // 使用 Promise.race 实现额外的超时保护
    const sendPromise = resend.emails.send({
      from: `${process.env.APP_NAME || "汪家俊的网站"} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: "登录验证 - 汪家俊的网站",
      html: getEmailTemplate(magicLinkUrl),
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("邮件发送超时，请检查网络连接或稍后重试")), 10000);
    });

    const { data, error } = await Promise.race([sendPromise, timeoutPromise]);

    if (error) {
      console.error("[Email] Failed to send magic link:", error);

      // 提供更友好的错误信息
      const errorMsg = error.message || String(error);
      if (errorMsg.includes("timeout") || errorMsg.includes("fetch") || errorMsg.includes("network")) {
        throw new Error("网络连接超时，请检查网络后重试");
      }

      throw new Error("邮件发送失败，请稍后重试");
    }

    console.log(`[Email] Magic link sent to ${email}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error("[Email] Failed to send magic link:", error.message);

    // 保留原始错误信息以便调试
    if (error.message?.includes("超时") || error.message?.includes("网络")) {
      throw error;
    }

    throw new Error("邮件发送失败，请稍后重试");
  }
}

/**
 * 发送留言通知邮件给管理员
 */
export async function sendMessageNotificationEmail(params: {
  username: string;
  userEmail: string | null;
  content: string;
  messageId?: number;
}) {
  const { username, userEmail, content, messageId } = params;

  // 从环境变量获取管理员邮箱列表
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

  if (adminEmails.length === 0) {
    console.warn('[Email] No admin emails configured, skipping notification');
    return { success: false, error: 'No admin emails configured' };
  }

  // 如果在开发环境且未配置邮件，只打印到控制台
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                  📬 新留言通知 (开发模式)                         ║
╠═══════════════════════════════════════════════════════════════════╣
║  收件人: ${adminEmails.join(', ').padEnd(57)}║
║  留言者: ${username.padEnd(57)}║
║  邮箱: ${(userEmail || '未提供').padEnd(59)}║
║  内容: ${content.substring(0, 50).padEnd(59)}║
║  ${content.length > 50 ? '...' : '   '}                                                              ║
║                                                                   ║
║  提示: 前往 /admin/messages 审核留言                              ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
    return { success: true };
  }

  try {
    const adminUrl = `${process.env.APP_URL || 'http://localhost:3000'}/admin/messages`;

    const { data, error } = await resend.emails.send({
      from: `${process.env.APP_NAME || "汪家俊的网站"} <${process.env.RESEND_FROM_EMAIL}>`,
      to: adminEmails,
      subject: `📬 新留言通知 - ${username}`,
      html: getMessageNotificationTemplate({
        username,
        userEmail,
        content,
        adminUrl,
        messageId,
      }),
    });

    if (error) {
      console.error('[Email] Failed to send message notification:', error);
      throw new Error("留言通知邮件发送失败");
    }

    console.log(`[Email] Message notification sent to ${adminEmails.join(', ')}, messageId: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[Email] Failed to send message notification:', error.message);
    // 邮件发送失败不应该影响留言提交，所以这里只记录错误
    return { success: false, error: error.message };
  }
}

/**
 * 邮件HTML模板
 */
function getEmailTemplate(magicLinkUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录验证</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔐 登录验证
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                您好！
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                您正在登录 <strong>汪家俊的个人网站</strong>，点击下方按钮即可完成登录。
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLinkUrl}"
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                      立即登录 →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>重要提示：</strong>
              </p>
              <ul style="margin: 8px 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <li>此链接仅在 <strong>5分钟</strong> 内有效</li>
                <li>如果按钮无法点击，请复制下方链接到浏览器：</li>
              </ul>

              <!-- Fallback Link -->
              <div style="margin: 16px 0; padding: 16px; background-color: #f9fafb; border-radius: 6px; border-left: 3px solid #667eea;">
                <p style="margin: 0; color: #6b7280; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                  ${magicLinkUrl}
                </p>
              </div>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                如果这不是您本人的操作，请忽略此邮件。
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} 汪家俊的个人网站 · 保留所有权利
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 留言通知邮件HTML模板
 */
function getMessageNotificationTemplate(params: {
  username: string;
  userEmail: string | null;
  content: string;
  adminUrl: string;
  messageId?: number;
}): string {
  const { username, userEmail, content, adminUrl, messageId } = params;
  const now = new Date();
  const timeStr = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新留言通知</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📬 新留言通知
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                您好，管理员！
              </p>
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                您的网站收到了一条新的留言，等待审核：
              </p>

              <!-- Message Info Box -->
              <div style="margin: 24px 0; padding: 24px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e; font-size: 14px;">留言者：</strong>
                      <span style="color: #451a03; font-size: 14px;">${username}</span>
                    </td>
                  </tr>
                  ${userEmail ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e; font-size: 14px;">邮箱：</strong>
                      <span style="color: #451a03; font-size: 14px;">${userEmail}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e; font-size: 14px;">提交时间：</strong>
                      <span style="color: #451a03; font-size: 14px;">${timeStr}</span>
                    </td>
                  </tr>
                  ${messageId ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e; font-size: 14px;">留言ID：</strong>
                      <span style="color: #451a03; font-size: 14px;">#${messageId}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Message Content -->
              <div style="margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; font-weight: 600;">
                  留言内容：
                </p>
                <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
                </div>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}"
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.4);">
                      前往审核留言 →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                提示：审核通过后，该留言将在留言板上公开显示。
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} 汪家俊的个人网站 · 系统自动通知，请勿回复
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
