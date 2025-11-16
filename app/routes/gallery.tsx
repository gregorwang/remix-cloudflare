import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import galleryStyles from "~/styles/gallery.css?url";
import { getCachedTokens } from "~/lib/token-cache.server";
import { pageMeta } from "~/utils/seo";

// TypeScript 类型定义
interface ImageData {
  id: number;
  src: string;
  size: string;
  alt: string;
}

interface GalleryPageData {
  columns: ImageData[][];
  heroImage: { id: string; src: string; alt: string };
  content: {
    heroTitle: string;
    authorName: string;
    bioSubtitle: string;
    bioDescription: string;
    footer: { title: string; description: string; linkText: string };
  };
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: galleryStyles },
];

// Meta 函数 - SEO优化
export const meta: MetaFunction = () => pageMeta.gallery();

// Loader 函数 - 在服务端批量生成所有图片token
export async function loader() {
  // 原始图片数据配置 - 按列分组
  const rawColumns: ImageData[][] = [
    // 第一列
    [
      { id: 1, src: '/photos/photo-1.webp', size: 'large', alt: '照片1描述' },
      { id: 2, src: '/photos/photo-2.webp', size: 'small', alt: '照片2描述' },
      { id: 3, src: '/photos/photo-3.webp', size: 'small', alt: '照片3描述' },
      { id: 4, src: '/photos/photo-4.webp', size: 'small', alt: '照片4描述' },
      { id: 5, src: '/photos/photo-5.webp', size: 'small', alt: '照片5描述' },
      { id: 6, src: '/photos/photo-6.webp', size: 'small', alt: '照片6描述' },
      { id: 7, src: '/photos/photo-7.webp', size: 'small', alt: '照片7描述' },
      { id: 8, src: '/photos/photo-8.webp', size: 'small', alt: '照片8描述' },
      { id: 9, src: '/photos/photo-9.webp', size: 'large', alt: '照片9描述' },
    ],
    
    // 第二列
    [
      { id: 10, src: '/photos/photo-10.webp', size: 'small', alt: '照片10描述' },
      { id: 11, src: '/photos/photo-11.webp', size: 'small', alt: '照片11描述' },
      { id: 12, src: '/photos/photo-12.webp', size: 'small', alt: '照片12描述' },
      { id: 13, src: '/photos/photo-13.webp', size: 'small', alt: '照片13描述' },
      { id: 14, src: '/photos/photo-14.webp', size: 'large', alt: '照片14描述' },
      { id: 15, src: '/photos/photo-15.webp', size: 'small', alt: '照片15描述' },
      { id: 16, src: '/photos/photo-16.webp', size: 'small', alt: '照片16描述' },
      { id: 17, src: '/photos/photo-17.webp', size: 'large', alt: '照片17描述' },
      { id: 18, src: '/photos/photo-18.webp', size: 'small', alt: '照片18描述' },
    ],
    
    // 第三列
    [
      { id: 19, src: '/photos/photo-19.webp', size: 'small', alt: '照片19描述' },
      { id: 20, src: '/photos/photo-20.webp', size: 'small', alt: '照片20描述' },
      { id: 21, src: '/photos/photo-21.webp', size: 'large', alt: '照片21描述' },
      { id: 22, src: '/photos/photo-22.webp', size: 'large', alt: '照片22描述' },
      { id: 23, src: '/photos/photo-23.webp', size: 'small', alt: '照片23描述' },
      { id: 24, src: '/photos/photo-24.webp', size: 'small', alt: '照片24描述' },
      { id: 25, src: '/photos/photo-25.webp', size: 'small', alt: '照片25描述' },
      { id: 26, src: '/photos/photo-26.webp', size: 'small', alt: '照片26描述' },
    ],
  ];

  // 扁平化所有图片，收集所有图片路径
  const allImages = rawColumns.flat();
  const allImagePaths = allImages.map(img => img.src);

  // 添加hero图片到路径列表
  const rawHeroImage = { id: 'hero', src: 'photos/ss.webp', alt: '2023~2025，往日之影' };
  const allPathsIncludingHero = [...allImagePaths, rawHeroImage.src];

  // 使用缓存批量生成所有图片token（包括hero图片）
  const tokenMap = getCachedTokens(allPathsIncludingHero, 30);

  // 重建columns结构，替换所有src为带token的完整URL
  const columns = rawColumns.map(column =>
    column.map(img => ({
      ...img,
      src: tokenMap.get(img.src.replace(/^\/+/, '')) || img.src
    }))
  );

  // 获取hero图片的tokenized URL
  const heroImage = { ...rawHeroImage, src: tokenMap.get(rawHeroImage.src) || rawHeroImage.src };

  const content = {
    heroTitle: "2023~2025，往日之影",
    authorName: "汪家俊",
    bioSubtitle: "自留",
    bioDescription:
      "这里的照片，是我毕业之后来到青岛工作闲暇之余所拍的照片，其中也有一些照片是在家乡拍的，工作了几个月双十一，买了小米14，手机拍照效果很好激发了我在日常用手机记录的习惯，也在这里留下了很多的照片。由于微信朋友圈会把任何体积10M以上图片压缩成几百K，导致画质效果非常难看，所以你在这里能看见一些我从未分享过的照片。",
    footer: {
      title: "镜头之外",
      description:
        "照片背后，总有些话想说。关于光影，关于瞬间，关于那些被镜头捕捉的思考与感悟。",
      linkText: "探索内心独白",
    },
  };

  const data: GalleryPageData = {
    columns,
    heroImage,
    content,
  };

  return json(data, {
    headers: {
      // 缓存29分钟（token有效期30分钟，留1分钟buffer）
      "Cache-Control": "public, max-age=1740, s-maxage=1740",
    },
  });
}

export default function Gallery() {
  const { columns, heroImage, content } = useLoaderData<typeof loader>();

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-primary-50">
        {/* Hero Image Section */}
        <div className="w-full my-0 relative h-96 overflow-hidden group">
          <img
            src={heroImage.src}
            alt={heroImage.alt}
            className="w-full h-full object-cover object-center rounded-lg shadow-md transition-transform duration-600 ease-expo-out group-hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-4xl md:text-6xl font-bold leading-tight tracking-tight drop-shadow-lg select-none">
              {content.heroTitle}
            </span>
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="content-area max-w-4xl mx-auto my-16 px-5">
          <h2 className="text-4xl font-bold leading-tight tracking-tight mb-6 text-primary-950">
            {content.authorName}
          </h2>
          <div className="bio-section">
            <h3 className="text-xs font-semibold uppercase text-primary-950/70 mb-2 tracking-wider">
              {content.bioSubtitle}
            </h3>
            <p className="text-base leading-relaxed text-primary-950/70 text-justify">
              {content.bioDescription}
            </p>
          </div>
        </div>

        {/* Gallery Grid Section */}
        <div className="gallery-container">
          <h1 className="gallery-title">摄影作品集</h1>
          <div className="gallery-grid">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="gallery-column">
                {column.map((photo) => (
                  <div
                    key={photo.id}
                    className={`gallery-item ${photo.size} group`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="transition-transform duration-600 ease-expo-out group-hover:scale-105"
                      onError={(e) => console.error('Image failed to load:', photo.src)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA Section */}
        <div className="footer-section bg-gradient-to-br from-primary-50 to-primary-100 py-20 px-5 text-center mt-16">
          <div className="footer-content max-w-2xl mx-auto">
            <div className="w-16 h-1 bg-gradient-to-r from-accent to-accent-hover mx-auto mb-8 rounded" />
            <h3 className="text-3xl font-semibold leading-tight tracking-tight text-primary-950 mb-5">
              {content.footer.title}
            </h3>
            <p className="text-base leading-relaxed text-primary-950/70 mb-10 italic">
              {content.footer.description}
            </p>
            <div>
              <Link
                to="/xiao"
                prefetch="intent"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent to-accent-hover text-white text-sm font-medium rounded-full transition-all duration-300 ease-expo-out hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm relative overflow-hidden group"
              >
                <span className="relative z-10">{content.footer.linkText}</span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 ease-expo-out group-hover:translate-x-1 group-hover:-translate-y-1 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-50 to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-expo-out"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
