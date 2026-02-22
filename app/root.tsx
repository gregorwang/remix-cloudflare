import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  json,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";

import tailwindStyles from "./tailwind.css?url";
import { getTheme, setTheme, type Theme } from "~/utils/theme.server";
import { getSessionCached } from "~/lib/auth.server";

// Root loader - Better Auth integration
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 获取主题
  const theme = await getTheme(request);

  // 获取 Better Auth session
  const session = await getSessionCached(request);

  return json({
    theme,
    session: session || null,
  });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "preload", as: "style", href: tailwindStyles },
  // CDN 预连接优化 - 减少图片加载延迟
  { rel: "preconnect", href: "https://oss.wangjiajun.asia" },
  { rel: "dns-prefetch", href: "https://oss.wangjiajun.asia" },
  { rel: "preconnect", href: "https://whylookthis.wangjiajun.asia" },
  { rel: "dns-prefetch", href: "https://whylookthis.wangjiajun.asia" },
];

// Root loader - Better Auth integration

// 处理主题切换
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const theme = formData.get("theme") as Theme;

  if (theme !== "light" && theme !== "dark") {
    return json({ error: "Invalid theme" }, { status: 400 });
  }

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await setTheme(theme),
      },
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const theme = data?.theme || "light";
  const location = useLocation();
  const isMusic = location.pathname.startsWith("/music");
  
  return (
    <html lang="zh-CN" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* 防止主题闪烁 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = document.cookie.match(/theme=([^;]+)/)?.[1] || 'light';
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
        {/* Adobe Fonts (思源宋体) - Optimized with font-display: swap */}
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="stylesheet" href="https://use.typekit.net/frm7mlm.css" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'source-han-serif-sc';
                font-display: swap; /* Show fallback font immediately */
              }
            `,
          }}
        />
      </head>
      <body className={isMusic ? undefined : "bg-primary-50 text-primary-950"}>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function App() {
  const { session } = useLoaderData<typeof loader>();
  return <Outlet context={{ session }} />;
}

export default App;

