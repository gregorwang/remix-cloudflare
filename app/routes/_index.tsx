import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { lazy, Suspense } from "react";
import styles from "~/styles/index-route.css?url";
import Header from "~/components/ui/Header";
import Faq from "~/components/ui/question";
import Footer from "~/components/ui/foot";
import ChangelogSection from "~/components/changelog-section";
import CursorTeamSection from "~/components/photo-section";
import CtaSection from "~/components/cta-section";
import { getSessionCached } from "~/lib/auth.server";
import { HOME_SONGS } from "~/lib/data/home-songs.server";
import { pageMeta } from "~/utils/seo";

// Lazy load heavy components for better initial load performance
const TabShowcase = lazy(() => import("~/components/tab-showcase"));
const VideoShowcase = lazy(() => import("~/components/video-showcase"));
const DonghuaSection = lazy(() => import("~/components/donghua"));

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preload", as: "image", href: "/favicon.ico" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const session = await getSessionCached(request);

    return json({
        userId: session?.user?.id || null,
        currentUser: session?.user || null,
        songs: HOME_SONGS,
    }, {
        headers: {
            "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
        }
    });
};

export const meta: MetaFunction = () => {
  return pageMeta.home();
};

export function ErrorBoundary() {
  const error = useRouteError();
  
  // 友好错误显示
  if (isRouteErrorResponse(error)) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-primary-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950 mb-2">
              {error.status === 404 ? '页面未找到' : '出现错误'}
            </h2>
            <p className="text-base leading-normal text-primary-950/70 mb-6">
              {error.status === 404 
                ? '抱歉，您访问的页面不存在。' 
                : `错误代码: ${error.status || 500}`}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block bg-accent text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 未知错误
  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center p-8 max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-primary-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950 mb-2">出现错误</h2>
          <p className="text-base leading-normal text-primary-950/70 mb-6">
            留言板加载失败，请稍后重试。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-accent text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm mr-4"
          >
            刷新页面
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-block bg-primary-100 text-primary-950 px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-100/80 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Plus icon component
interface PlusIconProps {
  strokeWidth?: number;
  className?: string;
}

const PlusIcon = ({ strokeWidth = 4, className = "" }: PlusIconProps) => (
  <svg 
    width="40" 
    height="40" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function Index() {
  const { userId, songs } = useLoaderData<typeof loader>();

  // JSON-LD 结构化数据 - 提升 SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "汪家俊",
    alternateName: "Wang Jiajun",
    url: "https://wangjiajun.asia",
    image: "https://oss.wangjiajun.asia/avatar.jpg",
    jobTitle: "全栈开发者",
    worksFor: {
      "@type": "Organization",
      name: "腾讯云雀",
    },
    knowsAbout: [
      "Web Development",
      "Full Stack Development",
      "Photography",
      "Game Design",
      "TypeScript",
      "React",
      "Node.js",
      "Remix",
      "AI Integration"
    ],
    sameAs: [
      // 添加您的社交媒体链接
      "https://github.com/wangjiajun",
    ],
  };

  return (
    <div className="font-sans">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      {/* Hero Section - 简化的静态版本 */}
      <section id="home" className="relative">
        <div className="animate-fade-in mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-20">
          <div className="mb-10 mt-4 md:mt-6">
            <div className="px-2">
              <div className="border-ali relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] md:px-12 md:py-20 transition-all duration-600 ease-expo-out">
                <h1 className="flex select-none flex-col px-3 py-2 text-center text-5xl font-bold leading-none tracking-tighter md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -left-5 -top-5 h-10 w-10"
                  />
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -bottom-5 -left-5 h-10 w-10"
                  />
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -right-5 -top-5 h-10 w-10"
                  />
                  <PlusIcon
                    strokeWidth={4}
                    className="text-ali absolute -bottom-5 -right-5 h-10 w-10"
                  />
                  AI织经纬，我赋其山海
                </h1>
                <div className="flex items-center justify-center gap-1">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <p className="text-xs font-semibold tracking-wide text-green-500">Available Now</p>
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-semibold md:text-2xl animate-fade-in" style={{ animationDelay: '150ms' }}>
              欢迎来到我的数字伊甸园，我是{" "}
              <span className="text-ali font-bold">汪家俊 </span>
            </h2>

            <p className="mx-auto mb-16 mt-2 max-w-2xl px-6 text-base leading-relaxed text-primary-950/60 sm:px-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              在这里，代码与思想交织，现实与虚拟的边界随之消融。这片由我与AI共同编织的领域,收藏着我的光影瞬间、心动旋律、热血故事，以及通往未来的足迹
            </p>
          </div>
        </div>

        {/* 静态背景 */}
        <div className="absolute inset-0 mx-auto pointer-events-none bg-gradient-to-br from-primary-50 via-transparent to-primary-100 opacity-30" />
      </section>
      <main>
        {/* Tab Showcase Section - Tab 展示区域 */}
        <Suspense fallback={
          <div className="w-full h-96 bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 bg-[length:200%_100%] animate-pulse rounded-xl" />
        }>
          <TabShowcase songs={songs} />
        </Suspense>

        <Suspense fallback={
          <div className="w-full h-[34rem] bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 bg-[length:200%_100%] animate-pulse rounded-xl" />
        }>
          <DonghuaSection />
        </Suspense>

        {/* Video Showcase Section - 视频展示区域 */}
        <Suspense fallback={
          <div className="w-full h-screen bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50 bg-[length:200%_100%] animate-pulse" />
        }>
          <VideoShowcase />
        </Suspense>

        {/* Photo Section - 图片区域 */}
        <CursorTeamSection />
        
        {/* Changelog Section - 更新日志 */}
        <section className="py-24 bg-primary-50">
            <div className="container mx-auto px-6">
                <ChangelogSection />
            </div>
        </section>
        
        {/* CTA Section - 留言板区域 */}
        <CtaSection userId={userId ?? null} />
      </main>
      <Faq />
      <Footer />
    </div>
  );
}


