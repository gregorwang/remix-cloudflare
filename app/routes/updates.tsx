import type { LinksFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";
import Header from "~/components/ui/Header";
import Footer from "~/components/ui/foot";
import { useEffect, useState } from "react";
import { pageMeta } from "~/utils/seo";

// 更新日志数据类型
export type UpdateType = 'feature' | 'fix' | 'improvement' | 'breaking';

export interface UpdateLog {
  id: string;
  version: string;
  date: string;
  type: UpdateType;
  title: string;
  description: string;
  items: string[];
}

interface UpdatesPageData {
  updates: UpdateLog[];
}

// Links function
export const links: LinksFunction = () => [];

// Meta function
export const meta: MetaFunction = () => pageMeta.updates();

// Loader function - 静态数据
export async function loader() {
  const updates: UpdateLog[] = [
    {
      id: '1',
      version: 'v1.11.0',
      date: '2025-11-10',
      type: 'improvement',
      title: '🎨 视觉与性能重大升级',
      description: '重新设计 Gallery 页面，大幅优化图片加载性能，提升用户体验',
      items: [
        '重新设计 Gallery 页面，参考优秀摄影网站最佳实践，替代原 Photo 页面',
        '将 36 张原图（180MB）压缩转换为 WebP 格式（14MB），大幅提升加载速度',
        '新增首页动画组件 donghua.tsx，增强视觉体验'
      ]
    },
    {
      id: '2',
      version: 'v1.10.9',
      date: '2025-11-09',
      type: 'improvement',
      title: '🔒 安全性增强',
      description: '为 Magic Link 登录添加限流策略，防止滥用',
      items: [
        '实现 Magic Link 登录限流机制',
        '优化安全策略配置'
      ]
    },
    {
      id: '3',
      version: 'v1.10.8',
      date: '2025-11-08',
      type: 'improvement',
      title: '🔒 安全性增强',
      description: '集成 Redis 缓存系统，为留言板添加访问限流机制',
      items: [
        '集成 Redis 缓存系统',
        '为留言板添加访问限流机制',
        '提升系统安全性和稳定性'
      ]
    },
    {
      id: '4',
      version: 'v1.10.7',
      date: '2025-11-07',
      type: 'feature',
      title: '🎵 新功能上线',
      description: '推出音乐播放器页面，集成多种登录方式',
      items: [
        '推出音乐播放器页面（musicindex.tsx）',
        '实现网易云音乐歌词滚动显示功能',
        '新增 Google 第三方登录',
        '集成 Resend API 实现 Magic Link 邮箱登录',
        '优化 Better Auth 登录体验'
      ]
    },
    {
      id: '5',
      version: 'v1.10.6',
      date: '2025-11-06',
      type: 'improvement',
      title: '⚡ 架构优化',
      description: '完全移除 Supabase 依赖，迁移至本地数据库方案',
      items: [
        '完全移除 Supabase 依赖，解决数据库连接延迟问题',
        '迁移至 Better Auth + 本地 SQLite',
        '首屏加载速度显著提升',
        '新增网站更新日志组件'
      ]
    },
    {
      id: '6',
      version: 'v1.10.5',
      date: '2025-11-05',
      type: 'improvement',
      title: '🔍 性能深度优化',
      description: '通过 Claude Code 进行全面性能审查，简化代码结构',
      items: [
        '通过 Claude Code 进行全面性能审查',
        '简化图片加载逻辑，部分资源迁移至 CDN',
        '移除不必要的 Token 加密，降低代码复杂度',
        '优化整体性能表现'
      ]
    },
    {
      id: '7',
      version: 'v1.10.4',
      date: '2025-11-04',
      type: 'improvement',
      title: '🎨 设计系统重构',
      description: '建立全新品牌色彩体系，提升视觉一致性',
      items: [
        '建立全新品牌色彩体系',
        '优化字距、行距和网格系统',
        '改造 Game 和 CV 页面，提升视觉一致性',
        '统一设计语言和组件规范'
      ]
    },
    {
      id: '8',
      version: 'v1.10.2',
      date: '2025-11-02',
      type: 'improvement',
      title: '⚡ 交互优化',
      description: '改进留言板加载策略，提升首屏性能',
      items: [
        '改进留言板加载策略：从首屏加载改为按需展开加载',
        '进一步提升首屏性能',
        '优化用户交互体验'
      ]
    },
    {
      id: '9',
      version: 'v1.9.29',
      date: '2024-10-29',
      type: 'fix',
      title: '🐛 问题修复',
      description: '修复 Term 页面部分深色模式切换按钮无响应问题',
      items: [
        '修复 Term 页面深色模式切换按钮无响应',
        '改进主题切换逻辑'
      ]
    },
    {
      id: '10',
      version: 'v1.9.28',
      date: '2024-10-28',
      type: 'improvement',
      title: '🎨 视觉优化',
      description: '引入思源字体，提升中文显示效果',
      items: [
        '引入思源字体，提升中文显示效果',
        '移除复杂 UI 组件，优化首屏加载',
        '精简字体效果，提升性能'
      ]
    },
    {
      id: '11',
      version: 'v1.9.27',
      date: '2024-10-27',
      type: 'improvement',
      title: '⚡ 性能提升',
      description: '优化 Game 页面性能，采用 Remix 推荐的架构模式',
      items: [
        '优化 Game 页面性能',
        '采用 Remix 推荐的 Outlet 模式',
        '避免重复数据请求，提升加载速度'
      ]
    },
    {
      id: '12',
      version: 'v1.9.26',
      date: '2024-10-26',
      type: 'improvement',
      title: '🔧 技术调研',
      description: '排查 Photo 页面卡顿问题，评估优化方案',
      items: [
        '排查 Photo 页面卡顿问题',
        '评估图片压缩方案',
        '制定性能优化计划'
      ]
    },
    {
      id: '13',
      version: 'v1.9.25',
      date: '2024-10-25',
      type: 'improvement',
      title: '♻️ 代码重构',
      description: '重构图片加载逻辑，遵循 Remix 最佳实践',
      items: [
        '重构图片加载逻辑：从 Hook 方式改为 Loader 函数直接获取',
        '整合 useImageToken 和 useVideo 代码，移除冗余',
        '遵循 Remix 推荐规范，优化代码结构',
        '修复 Photo 页面 DOM 重复渲染导致的图片加载失败问题'
      ]
    }
  ];

  const data: UpdatesPageData = {
    updates: updates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };

  return json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    }
  });
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

// 获取更新类型标签样式 - 使用设计系统颜色
function getTypeStyles(type: UpdateType): { bg: string; text: string; label: string } {
  switch (type) {
    case 'feature':
      return {
        bg: 'bg-accent/10',
        text: 'text-accent',
        label: '新功能'
      };
    case 'fix':
      return {
        bg: 'bg-primary-100',
        text: 'text-accent-hover',
        label: '修复'
      };
    case 'improvement':
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-950/70',
        label: '改进'
      };
    case 'breaking':
      return {
        bg: 'bg-accent/20',
        text: 'text-accent-hover',
        label: '重大变更'
      };
    default:
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-950/70',
        label: '更新'
      };
  }
}

// 更新日志卡片组件
function UpdateCard({ update, index }: { update: UpdateLog; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const typeStyles = getTypeStyles(update.type);

  useEffect(() => {
    // 检查用户是否偏好减少动画
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReduced = mediaQuery.matches;
    setPrefersReducedMotion(prefersReduced);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // 交错动画：每个卡片延迟50ms（如果用户不偏好减少动画）
    if (!prefersReduced) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * 50);

      return () => {
        clearTimeout(timer);
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // 如果偏好减少动画，立即显示
      setIsVisible(true);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [index]);

  return (
    <article
      className={`
        bg-primary-100 rounded-lg p-6 mb-6
        transition-all duration-600 ease-expo-out
        hover:duration-300 hover:-translate-y-1 hover:shadow-2xl
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
      style={{
        transitionDelay: prefersReducedMotion ? '0ms' : `${index * 50}ms`,
      }}
      suppressHydrationWarning
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">
              {update.version}
            </h3>
            <span className={`
              rounded-xs px-3 py-1 text-xs font-semibold uppercase tracking-wider
              ${typeStyles.bg} ${typeStyles.text}
            `}>
              {typeStyles.label}
            </span>
          </div>
          <p className="text-sm font-normal text-primary-950/70">
            {formatDate(update.date)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xl font-semibold leading-snug text-primary-950 mb-3">
          {update.title}
        </h4>
        <p className="text-base leading-relaxed text-primary-950/80">
          {update.description}
        </p>
      </div>

      <ul className="space-y-3">
        {update.items.map((item, itemIndex) => (
          <li
            key={itemIndex}
            className="flex items-start gap-2 text-base leading-relaxed text-primary-950/70"
          >
            <span className="text-accent mt-1 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

// 主页面组件
export default function Updates() {
  const { updates } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />
      
      <main className="max-w-[74.5rem] mx-auto px-6 sm:px-8 lg:px-8">
        {/* Hero Section */}
        <section className="py-section-md animate-fade-in">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary-950 mb-1">
              更新日志
            </h1>
            <p className="text-base leading-relaxed text-primary-950/70 max-w-[60rem] mx-auto">
              查看项目的最新更新和版本发布记录,了解我们持续改进的功能和修复
            </p>
          </div>

          {/* Updates List */}
          <div className="space-y-6 max-w-[60rem] mx-auto">
            {updates.map((update, index) => (
              <UpdateCard key={update.id} update={update} index={index} />
            ))}
          </div>
        </section>

        {/* Back to home link */}
        <div className="text-center py-8 pb-section-md">
          <Link
            to="/"
            prefetch="intent"
            className="
              inline-flex items-center gap-2
              text-accent hover:text-accent-hover
              text-sm font-medium
              transition-[color,transform] duration-300 ease-expo-out
              hover:-translate-y-0.5
            "
          >
            <span>←</span>
            <span>返回首页</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Error Boundary
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-6">
        <div className="bg-primary-100 rounded-lg p-6 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950 mb-3">
              {error.status === 404 ? '页面未找到' : '出现错误'}
            </h2>
            <p className="text-base leading-relaxed text-primary-950/70 mb-6">
              {error.status === 404 
                ? '抱歉，您访问的页面不存在。' 
                : `错误代码: ${error.status || 500}`}
            </p>
            <Link
              to="/"
              className="
                inline-block bg-accent text-white px-6 py-3 rounded text-sm font-medium
                hover:bg-accent-hover
                transition-[background-color,transform,box-shadow] duration-300 ease-expo-out
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-sm
              "
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 未知错误
  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-6">
      <div className="bg-primary-100 rounded-lg p-6 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950 mb-3">出现错误</h2>
          <p className="text-base leading-relaxed text-primary-950/70 mb-6">
            更新日志页面加载失败,请稍后重试。
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="
                bg-accent text-white px-6 py-3 rounded text-sm font-medium
                hover:bg-accent-hover
                transition-[background-color,transform,box-shadow] duration-300 ease-expo-out
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-sm
              "
            >
              刷新页面
            </button>
            <Link
              to="/"
              className="
                bg-primary-100 text-primary-950 px-6 py-3 rounded text-sm font-medium
                hover:bg-primary-100/80
                transition-[background-color,transform,box-shadow] duration-300 ease-expo-out
                hover:-translate-y-0.5 hover:shadow-lg
                active:translate-y-0 active:shadow-sm
              "
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

