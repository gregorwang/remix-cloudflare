import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { normalizeImageName, verifyImageToken } from "~/utils/imageToken.server";
import { getRuntimeEnv } from "~/utils/cloudflare-env.server";

function guessContentType(imageName: string): string {
  const lower = imageName.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const imageName = url.searchParams.get("imageName");

  if (!token || !imageName) {
    return new Response("Missing token or imageName", { status: 400 });
  }

  const normalizedImageName = normalizeImageName(imageName);
  if (!normalizedImageName || normalizedImageName.includes("..")) {
    return new Response("Invalid imageName", { status: 400 });
  }

  const verification = verifyImageToken(token, normalizedImageName);
  if (!verification.valid) {
    return new Response(verification.error || "Invalid token", { status: 401 });
  }

  const env = getRuntimeEnv() as { MEDIA_BUCKET?: R2Bucket };
  const bucket = env.MEDIA_BUCKET;
  if (!bucket) {
    return new Response("R2 binding MEDIA_BUCKET is missing", { status: 500 });
  }

  const object = await bucket.get(normalizedImageName);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", guessContentType(normalizedImageName));
  }

  const remainingTime = verification.remainingTime ?? 60;
  const cacheTime = Math.max(0, Math.min(300, remainingTime));
  headers.set("Cache-Control", `public, max-age=${cacheTime}, s-maxage=${cacheTime}`);

  return new Response(object.body, {
    status: 200,
    headers,
  });
}

