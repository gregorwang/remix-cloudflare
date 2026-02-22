import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { getAuthDb } from "./db.server";
import { sendMagicLinkEmail } from "./email.server";
import { MagicLinkRateLimitService } from "./rate-limit.server";
import { getEnvVar } from "~/utils/cloudflare-env.server";

function createAuth() {
  const appUrl = getEnvVar("APP_URL") || "http://localhost:3000";

  return betterAuth({
    database: {
      db: getAuthDb(),
      type: "sqlite",
    },
    baseURL: appUrl,
    appName: getEnvVar("APP_NAME") || "MyRemixApp",
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    socialProviders: {
      google: {
        clientId: getEnvVar("GOOGLE_CLIENT_ID") || "",
        clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET") || "",
      },
    },
    plugins: [
      magicLink({
        disableSignUp: false,
        expiresIn: 300,
        async sendMagicLink({ email, url }) {
          console.log(`[MagicLink] Attempting to send to ${email}`);

          try {
            const globalCheck = await MagicLinkRateLimitService.checkGlobalRateLimit();
            if (!globalCheck.allowed) {
              console.warn("[MagicLink] Global rate limit exceeded", {
                remaining: globalCheck.remaining,
              });
              throw new APIError("TOO_MANY_REQUESTS", {
                message: "请求过于频繁，请稍后再试",
              });
            }

            const emailCheck = await MagicLinkRateLimitService.checkEmailRateLimit(email);
            if (!emailCheck.allowed) {
              console.warn("[MagicLink] Email rate limit exceeded:", {
                email,
                resetAt: emailCheck.resetAt,
              });
              throw new APIError("TOO_MANY_REQUESTS", {
                message: "请求过于频繁，请稍后再试",
              });
            }

            const cooldownCheck = await MagicLinkRateLimitService.checkEmailCooldown(email);
            if (!cooldownCheck.allowed) {
              console.warn("[MagicLink] Email cooldown active:", {
                email,
                remainingSeconds: cooldownCheck.remainingSeconds,
                emailRemaining: emailCheck.remaining,
              });
              throw new APIError("TOO_MANY_REQUESTS", {
                message: "请求过于频繁，请稍后再试",
              });
            }

            console.log("[MagicLink] Rate limit checks passed:", {
              email,
              emailRemaining: emailCheck.remaining,
              globalRemaining: globalCheck.remaining,
            });
          } catch (error: unknown) {
            if (error instanceof APIError) {
              console.warn("[MagicLink] Rate limit triggered, blocking request:", error.message);
              throw error;
            }

            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes("请求过于频繁") || errorMessage.includes("后再试")) {
              console.warn("[MagicLink] Rate limit triggered (Error type), blocking request");
              throw new APIError("TOO_MANY_REQUESTS", { message: "请求过于频繁，请稍后再试" });
            }

            console.error("[MagicLink] Database error during rate limit check, allowing request:", error);
          }

          try {
            await sendMagicLinkEmail(email, url);
            console.log(`[MagicLink] Email sent successfully to ${email}`);
          } catch (emailError: unknown) {
            const emailErrorMessage = emailError instanceof Error ? emailError.message : String(emailError);
            console.error("[MagicLink] Email sending failed:", emailErrorMessage);
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: emailErrorMessage || "邮件发送失败，请稍后重试",
            });
          }
        },
      }),
    ],
  });
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (!authInstance) {
    authInstance = createAuth();
  }
  return authInstance;
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    return (getAuth() as Record<string, unknown>)[prop as string];
  },
});

type AuthSession = Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>;
const sessionCache = new WeakMap<Request, Promise<AuthSession>>();

export function getSessionCached(request: Request) {
  const cached = sessionCache.get(request);
  if (cached) {
    return cached;
  }

  const sessionPromise = getAuth()
    .api
    .getSession({ headers: request.headers })
    .catch((error) => {
      sessionCache.delete(request);
      throw error;
    });

  sessionCache.set(request, sessionPromise);
  return sessionPromise;
}

export async function requireAuth(request: Request) {
  const session = await getSessionCached(request);

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session.user;
}

export function isAdmin(email: string): boolean {
  const adminEmails = getEnvVar("ADMIN_EMAILS")?.split(",") || [];
  return adminEmails.map((item) => item.trim()).includes(email);
}

export async function requireAdmin(request: Request) {
  const user = await requireAuth(request);

  if (!user.email || !isAdmin(user.email)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
