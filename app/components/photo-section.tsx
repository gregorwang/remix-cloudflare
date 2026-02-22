import { Link } from "@remix-run/react"

export default function CursorTeamSection() {
  return (
    <section className="py-20 md:py-32 bg-primary-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 gap-12">
          {/* Left Content */}
          <div className="flex flex-col justify-start space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-950">
            暮海忽云映灯轨，阅三年余温。
            </h2>
            <Link
              to="/gallery"
              prefetch="intent"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover transition-colors w-fit"
            >
              走进完整作品集
              <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src="https://whylookthis.wangjiajun.asia/future.webp"
              alt="青岛海岸线的天空与城市剪影"
              className="w-full h-auto rounded-lg shadow-lg object-cover aspect-square md:aspect-auto"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
