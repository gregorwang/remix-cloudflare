import { createRequestHandler } from "@remix-run/cloudflare";
// eslint-disable-next-line import/no-unresolved
import * as build from "./build/server/index.js";
import { RateLimiterDO } from "./app/lib/rate-limiter-do";
import { setRuntimeEnv } from "./app/utils/cloudflare-env.server";

export interface Env {
  [key: string]: unknown;
  DB: D1Database;
  RATE_LIMITER: DurableObjectNamespace;
  MEDIA_BUCKET?: R2Bucket;
  AUTH_KEY_SECRET?: string;
  IMAGE_BASE_URL?: string;
  MEDIA_BASE_URL?: string;
  APP_URL?: string;
  APP_NAME?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ADMIN_EMAILS?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NODE_ENV?: string;
}

type RequestHandlerBuild = Parameters<typeof createRequestHandler>[0];
const handleRequest = createRequestHandler(build as unknown as RequestHandlerBuild);

function syncProcessEnv(env: Env) {
  const processRef = ((globalThis as unknown as { process?: { env?: Record<string, string> } }).process ??=
    { env: {} });

  if (!processRef.env) {
    processRef.env = {};
  }

  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      processRef.env[key] = value;
    }
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    setRuntimeEnv(env);
    syncProcessEnv(env);

    return handleRequest(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;

export { RateLimiterDO };
