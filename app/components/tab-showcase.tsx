import type React from "react"
import { Link } from "@remix-run/react"
import { useState, useRef, useEffect, useMemo } from "react"

interface Position {
  x: number
  y: number
}

interface LyricLine {
  time: number
  text: string
}

interface Song {
  id: string
  title: string
  artist: string
  url: string
  lyrics: string
}

interface TabShowcaseProps {
  songs: Song[]
}

export default function TabShowcase({ songs }: TabShowcaseProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lyricsListRef = useRef<HTMLDivElement>(null)

  // Parse LRC format
  const parseLRC = (lrcText: string): LyricLine[] => {
    const lines = lrcText.split('\n')
    const lyrics: LyricLine[] = []

    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3].padEnd(3, '0'))
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = match[4].trim()
        if (text) {
          lyrics.push({ time, text })
        }
      }
    })

    return lyrics.sort((a, b) => a.time - b.time)
  }

  // Get current song
  const currentSong = songs[currentSongIndex]

  // Parse lyrics from current song (memoized)
  const lyrics = useMemo(() => parseLRC(currentSong.lyrics), [currentSong.lyrics])

  // 判断是否是原文歌词（非中文翻译）
  const isOriginalLyric = (text: string): boolean => {
    // 如果包含日语假名（平假名或片假名），肯定是日语原文
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      return true
    }
    // 如果包含英文字母，肯定是英文原文
    if (/[a-zA-Z]/.test(text)) {
      return true
    }
    // 如果只包含中文汉字和标点，那是中文翻译
    return false
  }

  // Update current lyric index based on current time
  useEffect(() => {
    if (lyrics.length === 0) return

    let index = 0
    // Find the latest lyric that matches current time - 只更新原文歌词的高亮
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time && isOriginalLyric(lyrics[i].text)) {
        index = i
      } else if (currentTime < lyrics[i].time) {
        break
      }
    }
    setCurrentLyricIndex(index)

    // Scroll to current lyric (all languages)
    if (lyricsContainerRef.current && lyricsListRef.current) {
      const container = lyricsContainerRef.current
      const lyricsList = lyricsListRef.current
      const currentElement = lyricsList.children[index] as HTMLElement
      if (currentElement) {
        const containerHeight = container.clientHeight
        const elementTop = currentElement.offsetTop
        const elementHeight = currentElement.clientHeight
        const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2
        container.scrollTo({ top: scrollTop, behavior: 'smooth' })
      }
    }
  }, [currentTime, lyrics])

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

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = percent * duration
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Song navigation functions
  const playNextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length)
    setCurrentTime(0)
    // Will auto-play after song loads
    if (audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play()
        setIsPlaying(true)
      }, 100)
    }
  }

  const playPreviousSong = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length)
    setCurrentTime(0)
    // Will auto-play after song loads
    if (audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play()
        setIsPlaying(true)
      }, 100)
    }
  }

  // Auto-play next song when current song ends
  const handleSongEnded = () => {
    setIsPlaying(false)
    playNextSong()
  }

  // Reset playback when song changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load()
      setCurrentTime(0)
      setCurrentLyricIndex(0)
    }
  }, [currentSongIndex])

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
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-primary-950">
                    <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                      夺心之声
                    </span>
                  </h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent to-accent-hover rounded-full"></div>
                  <p className="text-xs text-primary-950/40 italic pt-1">
                    * 音乐来源于网络，仅供试听，请支持正版
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-base lg:text-lg text-primary-950/70 leading-relaxed max-w-sm">
                    2500+ 首歌曲，750+ 位艺术家。<br />
                    从 FELT 到 Vivienne，每首歌都是一段故事。
                  </p>
                  {/* Subtle scroll indicator */}
                  <Link
                    to="/music"
                    className="flex items-center gap-2 text-sm font-medium text-primary-950/60 pt-2 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
                  >
                    <span>向更深处探索音乐世界</span>
                    <svg
                      className="w-4 h-4 animate-bounce"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side - Window with background */}
            <div className="relative w-full lg:w-3/5 flex-shrink-0 flex items-center justify-center">
              {/* Background painting - contained within the right side, not full width */}
              <div className="absolute -inset-8 -right-16 lg:-inset-12 lg:-right-24 xl:-inset-16 xl:-right-32 bg-gradient-to-b from-primary-100 to-primary-50 rounded-l-3xl overflow-hidden">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src="https://cdn.sanity.io/images/2hv88549/production/6a23c94721e22f5c31f2ef72ccd7cdf9fecd9e12-1995x1330.jpg?auto=format&w=2000&q=80"
                    alt="Stone texture background"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-primary-50/5 pointer-events-none" />
                </div>
              </div>

              {/* Floating content container - positioned relative to right side container */}
              <div className="relative z-20 flex items-start gap-3">
                {/* Main player */}
                <div
                  ref={windowRef}
                  className={`relative ${
                    !isMobile ? "cursor-grab" : ""
                  } ${isDragging ? "cursor-grabbing" : ""}`}
                  style={
                    !isMobile
                      ? {
                          transform: `translate(${position.x}px, ${position.y}px)`,
                          width: "480px",
                          height: "400px",
                        }
                      : {
                          width: "100%",
                          maxWidth: "480px",
                          height: "400px",
                        }
                  }
                  onMouseDown={handleMouseDown}
                  role={!isMobile ? "button" : undefined}
                  tabIndex={!isMobile ? 0 : undefined}
                  aria-label={!isMobile ? "拖拽播放器" : undefined}
                >
                {/* Lyrics scrolling area */}
                <div 
                  ref={lyricsContainerRef}
                  className="relative w-full h-[calc(100%-90px)] mb-2 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-primary-100 to-primary-50 rounded-t-lg"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div ref={lyricsListRef} className="w-full px-6 py-8">
                    {lyrics.map((lyric, index) => {
                      // 只有原文歌词才会高亮
                      const shouldHighlight = index === currentLyricIndex && isOriginalLyric(lyric.text)
                      const isChinese = !isOriginalLyric(lyric.text)

                      return (
                        <p
                          key={index}
                          className={`mb-3 text-sm leading-relaxed transition-all duration-300 ${
                            shouldHighlight
                          ? 'text-accent text-base font-semibold scale-105'
                          : isChinese
                          ? 'text-primary-950/50 text-xs'
                          : 'text-primary-950/70'
                          }`}
                        >
                          {lyric.text}
                        </p>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Music player styled like NetEase */}
                <div className="w-full bg-primary-50 rounded-b-lg shadow-lg border border-primary-100 p-3">
                  {/* Progress bar */}
                  <div 
                    className="w-full h-1 bg-primary-100 rounded-full cursor-pointer mb-2"
                    onClick={handleSeek}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSeek(e as unknown as React.MouseEvent<HTMLDivElement>)
                      }
                    }}
                    role="slider"
                    tabIndex={0}
                    aria-label="播放进度"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={currentTime}
                  >
                    <div 
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Previous button */}
                      <button
                        onClick={playPreviousSong}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 hover:bg-primary-200 transition-colors"
                        aria-label="上一首"
                      >
                        <svg className="w-4 h-4 text-primary-950" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                      </button>

                      {/* Play/Pause button */}
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-accent hover:bg-accent-hover transition-colors"
                        aria-label={isPlaying ? "暂停" : "播放"}
                      >
                        {isPlaying ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Next button */}
                      <button
                        onClick={playNextSong}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-100 hover:bg-primary-200 transition-colors"
                        aria-label="下一首"
                      >
                        <svg className="w-4 h-4 text-primary-950" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                      </button>

                      {/* Song info */}
                      <div className="flex flex-col ml-1">
                        <span className="text-xs font-semibold tracking-wide text-primary-950 truncate max-w-[140px]">
                          {currentSong.artist} - {currentSong.title}
                        </span>
                        <span className="text-xs text-primary-950/60">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                    </div>

                    {/* Song counter and playlist toggle */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-accent font-bold">
                        {currentSongIndex + 1}/{songs.length}
                      </div>
                      <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-primary-100 hover:bg-primary-200 transition-colors"
                        aria-label="播放列表"
                      >
                        <svg className="w-4 h-4 text-primary-950" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src={currentSong.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleSongEnded}
                  aria-label="音乐播放器"
                  preload="metadata"
                >
                  <track kind="captions" />
                </audio>
                </div>

                {/* Playlist panel */}
                {showPlaylist && (
                  <div className="w-64 h-[400px] bg-primary-50 rounded-lg shadow-lg border border-primary-100 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 bg-primary-100 border-b border-primary-200">
                      <h3 className="text-sm font-semibold text-primary-950">播放列表</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {songs.map((song, index) => (
                        <button
                          key={song.id}
                          onClick={() => {
                            setCurrentSongIndex(index)
                            setCurrentTime(0)
                            setTimeout(() => {
                              audioRef.current?.play()
                              setIsPlaying(true)
                            }, 100)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-primary-100 transition-colors border-b border-primary-100/50 ${
                            index === currentSongIndex ? 'bg-accent/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {index === currentSongIndex && (
                              <svg className="w-3 h-3 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-primary-950 truncate">
                                {song.artist}
                              </p>
                              <p className="text-xs text-primary-950/60 truncate">
                                {song.title}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
