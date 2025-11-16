import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { db } from "./db.server";
import { sendMagicLinkEmail } from "./email.server";
import { MagicLinkRateLimitService } from "./rate-limit.server";

// 获取应用URL
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// 配置Better Auth
export const auth = betterAuth({
  database: db,
  // 基础URL
  baseURL: APP_URL,
  // 应用名称
  appName: "MyRemixApp",
  // 会话配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7天
    updateAge: 60 * 60 * 24, // 1天后更新
  },
  // 社交登录
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  // 插件
  plugins: [
    magicLink({
      disableSignUp: false, // 允许通过 magic link 注册
      expiresIn: 300, // 5分钟
      async sendMagicLink({ email, url, token }) {
        console.log(`[MagicLink] Attempting to send to ${email}`);

        try {
          // 1. 检查全局限流（100次/小时）
          const globalCheck = await MagicLinkRateLimitService.checkGlobalRateLimit();
          if (!globalCheck.allowed) {
            console.warn("[MagicLink] Global rate limit exceeded", {
              remaining: globalCheck.remaining
            });
            throw new APIError("TOO_MANY_REQUESTS", {
              message: "请求过于频繁，请稍后再试"
            });
          }

          // 2. 检查邮箱限流（3次/小时）
          const emailCheck = await MagicLinkRateLimitService.checkEmailRateLimit(email);
          if (!emailCheck.allowed) {
            console.warn("[MagicLink] Email rate limit exceeded:", {
              email,
              resetAt: emailCheck.resetAt
            });
            throw new APIError("TOO_MANY_REQUESTS", {
              message: "请求过于频繁，请稍后再试"
            });
          }

          // 3. 检查冷却时间（60秒）
          const cooldownCheck = await MagicLinkRateLimitService.checkEmailCooldown(email);
          if (!cooldownCheck.allowed) {
            console.warn("[MagicLink] Email cooldown active:", {
              email,
              remainingSeconds: cooldownCheck.remainingSeconds,
              emailRemaining: emailCheck.remaining
            });
            throw new APIError("TOO_MANY_REQUESTS", {
              message: "请求过于频繁，请稍后再试"
            });
          }

          console.log("[MagicLink] Rate limit checks passed:", {
            email,
            emailRemaining: emailCheck.remaining,
            globalRemaining: globalCheck.remaining,
          });

        } catch (error: any) {
          // 如果是 APIError（限流错误），直接抛出
          if (error instanceof APIError) {
            console.warn("[MagicLink] Rate limit triggered, blocking request:", error.message);
            throw error; // 直接抛出，阻止发送邮件
          }

          // 如果是普通错误但包含限流关键词，也要阻止
          // 统一使用通用错误信息，不泄露具体策略
          if (error.message?.includes("请求过于频繁") ||
              error.message?.includes("后再试")) {
            console.warn("[MagicLink] Rate limit triggered (Error type), blocking request");
            throw new APIError("TOO_MANY_REQUESTS", { message: "请求过于频繁，请稍后再试" });
          }

          // 数据库错误时降级：允许发送，但记录日志
          console.error("[MagicLink] Database error during rate limit check, allowing request:", error);
        }

        // 通过所有检查，发送邮件
        try {
          await sendMagicLinkEmail(email, url);
          console.log(`[MagicLink] Email sent successfully to ${email}`);
        } catch (emailError: any) {
          console.error("[MagicLink] Email sending failed:", emailError.message);
          // 使用 APIError 包装错误，确保前端能正确接收
          throw new APIError("INTERNAL_SERVER_ERROR", {
            message: emailError.message || "邮件发送失败，请稍后重试"
          });
        }
      },
    }),
  ],
});

// 辅助函数：要求用户登录
export async function requireAuth(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session.user;
}

// 辅助函数：检查是否为管理员
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

// 辅助函数：要求管理员权限
export async function requireAdmin(request: Request) {
  const user = await requireAuth(request);

  if (!user.email || !isAdmin(user.email)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
