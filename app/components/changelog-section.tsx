import ChangelogCard from "./changelog-card"

interface ChangelogEntry {
  version: string
  date: string
  description: string
}

const entries: ChangelogEntry[] = [
  {
    version: "v1.11.0",
    date: "Nov 10, 2025",
    description: "🎨 视觉与性能重大升级 - Gallery 重设计，图片压缩优化",
  },
  {
    version: "v1.10.7",
    date: "Nov 7, 2025",
    description: "🎵 音乐播放器上线 - 网易云歌词滚动，Google 登录集成",
  },
  {
    version: "v1.10.6",
    date: "Nov 6, 2025",
    description: "⚡ 架构优化 - 移除 Supabase，迁移至本地 SQLite",
  },
  {
    version: "v1.10.4",
    date: "Nov 4, 2025",
    description: "🎨 设计系统重构 - 全新品牌色彩体系与视觉规范",
  },
]

export default function ChangelogSection() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-semibold leading-tight tracking-tight mb-8 text-foreground">更新日志</h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {entries.map((entry) => (
          <ChangelogCard key={entry.version} {...entry} />
        ))}
      </div>

      {/* Link */}
      <div className="mt-8">
        <a
          href="/updates"
          className="inline-flex items-center gap-0.5 text-sm font-medium text-accent hover:text-accent-hover transition-[color,transform] duration-300 ease-expo-out hover:-translate-y-0.5"
        >
          查看完整更新日志
          <span className="text-xl">→</span>
        </a>
      </div>
    </div>
  )
}
