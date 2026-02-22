import type { MetaDescriptor } from "@remix-run/cloudflare";

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const DEFAULT_OG_IMAGE = "https://oss.wangjiajun.asia/og/default.jpg";
const SITE_NAME = "汪家俊的个人网站";
const TWITTER_HANDLE = "@wangjiajun"; // 如果有Twitter账号

export function generateMeta(config: SEOConfig): MetaDescriptor[] {
  const {
    title,
    description,
    image = DEFAULT_OG_IMAGE,
    url,
    type = "website",
    keywords = [],
    author = "汪家俊 (Wang Jiajun)",
    publishedTime,
    modifiedTime,
  } = config;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  const meta: MetaDescriptor[] = [
    // 基础meta标签
    { title: fullTitle },
    { name: "description", content: description },
    { name: "author", content: author },

    // 关键词 (虽然SEO价值有限，但不会有害)
    ...(keywords.length > 0 ? [{ name: "keywords", content: keywords.join(", ") }] : []),

    // Open Graph标签 (Facebook, 微信, LinkedIn等)
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "zh_CN" },

    // Twitter Card标签
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:creator", content: TWITTER_HANDLE },

    // 规范化URL
    { tagName: "link", rel: "canonical", href: url },
  ];

  // 文章类型的额外标签
  if (type === "article") {
    if (publishedTime) {
      meta.push({ property: "article:published_time", content: publishedTime });
    }
    if (modifiedTime) {
      meta.push({ property: "article:modified_time", content: modifiedTime });
    }
    meta.push({ property: "article:author", content: author });
  }

  return meta;
}

// 快捷函数：为主要页面生成meta
export const pageMeta = {
  home: () =>
    generateMeta({
      title: "汪家俊的个人网站 - 将我的爱弃置于此",
      description: "欢迎来到汪家俊(Wang Jiajun)的数字伊甸园。AI协同开发者，游戏探索者（1546h+），光影记录者（214张作品），旋律收藏家（2500+首）。将我的爱弃置于此。",
      url: "https://wangjiajun.asia",
      type: "profile",
      keywords: ["汪家俊", "Wang Jiajun", "wangjiajun", "AI开发", "游戏", "摄影", "音乐", "动漫"],
    }),

  gallery: () =>
    generateMeta({
      title: "摄影作品集",
      description: "精选摄影作品集，记录生活中的美好瞬间与光影故事，涵盖风景、人像、街拍等多种风格",
      url: "https://wangjiajun.asia/gallery",
      image: "https://oss.wangjiajun.asia/og/gallery.jpg",
      keywords: ["摄影", "作品集", "风景摄影", "街拍", "汪家俊摄影"],
    }),

  chat: () =>
    generateMeta({
      title: "AI聊天室 - 与Nemesis对话",
      description: "与AI助手Nemesis进行智能对话，探讨技术、创意和生活。基于先进的AI技术，提供自然流畅的交互体验。",
      url: "https://wangjiajun.asia/chat",
      image: "https://oss.wangjiajun.asia/og/chat.jpg",
      keywords: ["AI聊天", "人工智能", "对话机器人", "Nemesis"],
    }),

  cv: () =>
    generateMeta({
      title: "褪色者宣言 - 汪家俊的冒险履历",
      description: "汪家俊的冒险履历，云雀守望者公会高级质检专员，交界地王立学院生命医学学士。AI协同开发者（ChatGPT & Claude），游戏探索者（艾尔登法环100h白金），光影记录者（214张作品）。将我的爱弃置于此。",
      url: "https://wangjiajun.asia/cv",
      image: "https://oss.wangjiajun.asia/og/cv.jpg",
      type: "profile",
      keywords: ["简历", "汪家俊", "AI协同开发", "游戏", "摄影", "艾尔登法环"],
    }),

  game: () =>
    generateMeta({
      title: "游戏中心 - 我的游戏收藏",
      description: "个人游戏收藏库，包含PlayStation、Nintendo Switch和PC平台的精选游戏，分享游戏体验与评价。",
      url: "https://wangjiajun.asia/game",
      image: "https://oss.wangjiajun.asia/og/game.jpg",
      keywords: ["游戏", "PlayStation", "Switch", "PC游戏", "游戏收藏"],
    }),

  anime: () =>
    generateMeta({
      title: "最喜欢的动漫",
      description: "精选动漫推荐，分享我喜爱的动漫作品、角色和故事，涵盖热血、治愈、悬疑等多种类型。",
      url: "https://wangjiajun.asia/anime",
      image: "https://oss.wangjiajun.asia/og/anime.jpg",
      keywords: ["动漫", "动画", "日本动漫", "动漫推荐"],
    }),

  music: () =>
    generateMeta({
      title: "音乐播放器 - 我的音乐收藏",
      description: "探索我的音乐世界，包含2500+首精选歌曲，涵盖流行、电子、古典等多种风格，支持在线播放和歌词显示。",
      url: "https://wangjiajun.asia/music",
      image: "https://oss.wangjiajun.asia/og/music.jpg",
      keywords: ["音乐", "音乐播放器", "歌曲", "在线音乐"],
    }),

  updates: () =>
    generateMeta({
      title: "更新日志",
      description: "网站更新日志，记录功能更新、Bug修复和性能优化等开发历程。",
      url: "https://wangjiajun.asia/updates",
      type: "article",
      keywords: ["更新日志", "网站更新", "开发日志"],
    }),

  messages: () =>
    generateMeta({
      title: "留言板",
      description: "在这里留下你的想法、建议或问候，与我分享你的故事。",
      url: "https://wangjiajun.asia/messages",
      keywords: ["留言板", "留言", "反馈"],
    }),
};

