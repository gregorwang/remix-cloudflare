// Better Auth API 路由
// 处理所有 /api/auth/* 的请求，包括OAuth回调
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { auth } from "~/lib/auth.server";
import { MagicLinkRateLimitService } from "~/lib/rate-limit.server";
import { getClientIP } from "~/utils/request.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  // 拦截 Magic Link 请求进行 IP 限流检查
  const url = new URL(request.url);
  const isMagicLinkRequest = url.pathname === "/api/auth/sign-in/magic-link";

  if (isMagicLinkRequest) {
    const clientIP = getClientIP(request);
    
    console.log("[MagicLink] IP rate limit check:", {
      ip: clientIP,
      timestamp: new Date().toISOString(),
    });

    try {
      // IP 限流检查（5次/小时）- 第一道防线
      const ipCheck = await MagicLinkRateLimitService.checkIPRateLimit(clientIP);
      
      if (!ipCheck.allowed) {
        console.warn("[MagicLink] IP rate limit exceeded:", {
          ip: clientIP,
          resetAt: ipCheck.resetAt,
        });
        
        // 返回通用错误信息，不泄露具体限流策略
        return json(
          { 
            error: "请求过于频繁，请稍后再试",
            message: "请求过于频繁，请稍后再试"
          },
          { status: 429 }
        );
      }

      console.log("[MagicLink] IP rate limit passed:", {
        ip: clientIP,
        remaining: ipCheck.remaining,
      });
    } catch (error) {
      // 数据库错误时降级：允许请求通过，记录日志
      console.error("[MagicLink] IP rate limit check error, allowing request:", error);
    }
  }

  // 通过 IP 限流后，继续执行 Better Auth 的正常流程
  return auth.handler(request);
}

