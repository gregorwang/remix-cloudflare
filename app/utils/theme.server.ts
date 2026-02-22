import { createCookie } from "@remix-run/cloudflare";
import { getEnvVar } from "~/utils/cloudflare-env.server";

export type Theme = "light" | "dark";

function getThemeCookie() {
  return createCookie("theme", {
    maxAge: 31_536_000, // 1 year
    httpOnly: false, // allow client-side read
    secure: getEnvVar("NODE_ENV") === "production",
    sameSite: "lax",
  });
}

export async function getTheme(request: Request): Promise<Theme> {
  const themeCookie = getThemeCookie();
  const cookieHeader = request.headers.get("Cookie");
  const theme = await themeCookie.parse(cookieHeader);
  return theme === "dark" ? "dark" : "light";
}

export async function setTheme(theme: Theme) {
  const themeCookie = getThemeCookie();
  return themeCookie.serialize(theme);
}
