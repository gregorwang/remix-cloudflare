import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link } from "@remix-run/react"

const VIDEO_POSTER =
  "https://cdn.sanity.io/images/2hv88549/production/1ffde036387b7242c29496bd7b1009f2218bce43-3266x2324.jpg?auto=format&w=1200&q=60"

interface Position {
  x: number
  y: number
}

export default function VideoShowcase() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-primary-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="presentation"
    >
      {/* Layer 1: White background */}
      <div className="absolute inset-0 bg-primary-50" />

      {/* Content layout with max-width container and padding */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="relative w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left side - Text content */}
            <div className="w-full lg:w-2/5 flex-shrink-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-primary-950">羊蹄山之魂</h1>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                </div>
                <div className="space-y-3 max-w-sm">
                  <p className="text-base lg:text-lg text-primary-950/70 leading-relaxed whitespace-pre-line">
                    血染刀刃，泪湿衣襟。

                    三味线低吟着复仇之歌，

                    狼之刀鍔在北境的风雪中闪耀。
                  </p>
                  <p className="text-base lg:text-lg text-primary-950/70 leading-relaxed whitespace-pre-line">
                    每一次滑动手柄，每一缕指引之风，

                    都在告诉我——

                    这条路，还要继续走下去。

                    游戏如此，人生亦如此。
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/game"
                      prefetch="intent"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-hover text-white text-sm font-medium rounded-[12px] transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                    >
                      追随指引之风
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Window with background */}
            <div className="relative w-full lg:w-3/5 flex-shrink-0 flex items-center justify-center">
              {/* Background painting - contained within the right side, not full width */}
              <div className="absolute -inset-8 -right-16 lg:-inset-12 lg:-right-24 xl:-inset-16 xl:-right-32 bg-gradient-to-b from-primary-100 to-primary-50 rounded-l-3xl overflow-hidden">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={VIDEO_POSTER}
                    alt="Oil painting background"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="1200"
                    height="855"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-primary-50/3 pointer-events-none" />
                </div>
              </div>

              {/* Video player - positioned relative to right side container */}
              <div
                ref={windowRef}
                className={`relative z-20 rounded-xl shadow-2xl overflow-hidden border border-primary-100/30 transition-all ${
                  !isMobile ? "cursor-grab hover:shadow-3xl" : ""
                } ${isDragging ? "cursor-grabbing" : ""}`}
                style={
                  !isMobile
                    ? {
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        width: "640px",
                        height: "360px",
                      }
                    : {
                        width: "100%",
                        maxWidth: "480px",
                        aspectRatio: "16/9",
                      }
                }
                onMouseDown={handleMouseDown}
                role={!isMobile ? "button" : undefined}
                tabIndex={!isMobile ? 0 : undefined}
                aria-label={!isMobile ? "拖拽播放器" : undefined}
              >
                {/* Video content area */}
                <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
                  <video
                    src="https://whylookthis.wangjiajun.asia/yotei.mp4"
                    controls
                    preload="none"
                    poster={VIDEO_POSTER}
                    className="w-full h-full object-contain"
                    playsInline
                    title="羊蹄山之魂 - 对马岛之魂游戏视频"
                  >
                    <track
                      kind="captions"
                      src="/captions/yotei.vtt"
                      srcLang="en"
                      label="English captions"
                      default
                    />
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
