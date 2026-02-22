import { useEffect, useState, useMemo } from "react"
import { Link, useFetcher, useRevalidator } from "@remix-run/react"
import type { action } from "~/routes/messages"

const EMOJIS = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🫣', '🤗', '🫡', '🤔', '🫢', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🫥', '🤐', '🥴', '🤢', '🤮', '🤧', '😷']
const EMOJIS_PER_PAGE = 32
const MESSAGES_PER_PAGE = 10

interface Message {
  id: number
  user_id: string
  username: string
  content: string
  status: string
  created_at: string
  isPending?: boolean
}

interface CommentsBoardProps {
  messages: Message[]
  userPendingMessages?: Message[]
  userId: string | null
  defaultAvatar: string
  currentUserName?: string
}

/** Toast 组件 */
function Toast({ type, text, onClose }: { type: 'success' | 'error'; text: string; onClose: () => void }) {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[220px] max-w-xs px-4 py-3 rounded-xl shadow-lg flex items-start gap-2 animate-fade-in-down
        ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}
    >
      {type === 'success' ? (
        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm leading-relaxed break-words flex-1">{text}</span>
      <button onClick={onClose} className="ml-1 p-0.5 rounded hover:bg-black/5">
        <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function CommentsBoard({ messages, userPendingMessages = [], userId, defaultAvatar, currentUserName }: CommentsBoardProps) {
  const fetcher = useFetcher<typeof action>()
  const revalidator = useRevalidator()

  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiPage, setEmojiPage] = useState(0)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(MESSAGES_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set())

  const isSubmitting = fetcher.state === "submitting"

  // 统一的提示函数
  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
  }

  // 自动隐藏 toast（5秒后）
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(id)
    }
  }, [toast])

  // 响应处理
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data as { success?: string; error?: string }

      if (data.success) {
        showToast('success', data.success)
        setMessage('')
        setShowEmojiPicker(false)
        revalidator.revalidate()
        setDisplayedMessagesCount(MESSAGES_PER_PAGE)
      } else if (data.error) {
        showToast('error', data.error)
      }
    }
  }, [fetcher.state, fetcher.data, revalidator])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.emoji-picker') && !target.closest('.emoji-trigger')) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showEmojiPicker])

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const getCurrentPageEmojis = () => {
    const startIndex = emojiPage * EMOJIS_PER_PAGE
    return EMOJIS.slice(startIndex, startIndex + EMOJIS_PER_PAGE)
  }

  const totalEmojiPages = Math.ceil(EMOJIS.length / EMOJIS_PER_PAGE)

  const getUserDisplayName = (msg: Message) => {
    if (!msg || typeof msg !== 'object') return 'Unknown User'

    const username = msg.username
    if (typeof username === 'string' && username.trim()) {
      return username
    }

    const userId = msg.user_id
    if (typeof userId === 'string' && userId.length > 0) {
      return `User ${userId.substring(0, 8)}`
    }

    return 'Unknown User'
  }

  const getUserAvatar = () => {
    if (typeof defaultAvatar === 'string') {
      return defaultAvatar
    }
    return "/favicon.ico"
  }

  // 合并 approved 消息和用户自己的 pending 消息
  const messagesArray = useMemo(() => {
    // 过滤和验证 approved 消息
    const validApprovedMessages = Array.isArray(messages)
      ? messages.filter(msg => {
          if (!msg || typeof msg !== 'object') return false
          if (!msg.id || !msg.content) return false
          if (typeof msg.content !== 'string') return false
          return true
        })
      : []

    // 过滤和验证 pending 消息，并标记为 isPending
    const validPendingMessages = Array.isArray(userPendingMessages)
      ? userPendingMessages
          .filter(msg => {
            if (!msg || typeof msg !== 'object') return false
            if (!msg.id || !msg.content) return false
            if (typeof msg.content !== 'string') return false
            return true
          })
          .map(msg => ({ ...msg, isPending: true }))
      : []

    // 合并并按创建时间排序
    const combined = [...validPendingMessages, ...validApprovedMessages]
    return combined.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()
      return timeB - timeA // 降序排序，最新的在前
    })
  }, [messages, userPendingMessages])

  // 懒加载更多留言
  const loadMoreMessages = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedMessagesCount(prev => Math.min(prev + MESSAGES_PER_PAGE, messagesArray.length))
      setIsLoadingMore(false)
    }, 300)
  }

  // 获取当前要显示的留言
  const displayedMessages = useMemo(() =>
    messagesArray.slice(0, displayedMessagesCount),
    [messagesArray, displayedMessagesCount]
  )
  const hasMoreMessages = displayedMessagesCount < messagesArray.length

  // 切换展开/收起
  const toggleExpand = (id: number) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 表单提交处理
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim()) return
    setShowEmojiPicker(false)
    fetcher.submit(e.currentTarget, { method: "post", action: "/messages" })
  }

  return (
    <div className="w-full bg-primary-100 rounded-2xl border border-primary-100 p-6 shadow-sm animate-fade-in">
      {/* Toast 提示 */}
      {toast && <Toast type={toast.type} text={toast.text} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">留言板</h3>
        <p className="text-gray-600">{messagesArray.length} 条留言</p>
      </div>

      {/* Messages Display */}
      {messagesArray.length > 0 ? (
        <div className="mb-8">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {displayedMessages.map((msg: Message, index: number) => {
              const isOwnMessage = msg.user_id === userId?.toString()
              const isExpanded = expandedMessages.has(msg.id)
              const shouldShowExpandButton = msg.content.length > 100

              return (
                <div
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  key={msg.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`flex items-start space-x-3 max-w-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <img
                      src={getUserAvatar()}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      loading="lazy"
                    />
                    <div className={`rounded-2xl px-4 py-3 shadow-md ${
                      isOwnMessage
                        ? 'bg-accent hover:bg-accent-hover text-white rounded-tr-sm'
                        : 'bg-primary-50 text-primary-950 border border-primary-100 rounded-tl-sm'
                    } ${msg.isPending ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`text-xs flex-1 ${isOwnMessage ? 'opacity-80' : 'text-gray-500'}`}>
                          {getUserDisplayName(msg)}
                        </div>
                        {msg.isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            审核中
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isExpanded || !shouldShowExpandButton ? '' : 'line-clamp-3'}`}>
                        {typeof msg.content === 'string' ? msg.content : '内容加载失败'}
                      </p>
                      {shouldShowExpandButton && (
                        <button
                          onClick={() => toggleExpand(msg.id)}
                          className={`mt-2 flex items-center gap-1 text-xs font-medium transition-all duration-300 ease-expo-out hover:-translate-y-0.5 ${
                            isOwnMessage ? 'text-white/80 hover:text-white' : 'text-accent hover:text-accent-hover'
                          }`}
                        >
                          {isExpanded ? "收起" : "展开"}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-300 ease-expo-out ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* 加载更多按钮 */}
            {hasMoreMessages && (
              <div className="text-center py-4">
                <button
                  onClick={loadMoreMessages}
                  disabled={isLoadingMore}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-accent bg-primary-50 border border-accent/30 rounded-lg hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      加载中...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      加载更多 ({messagesArray.length - displayedMessagesCount} 条)
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 显示总数信息 */}
            {messagesArray.length > MESSAGES_PER_PAGE && (
              <div className="text-center py-2">
                <p className="text-gray-400 text-xs">
                  显示 {displayedMessages.length} / {messagesArray.length} 条留言
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">💬</span>
          </div>
          <p>还没有留言，快来成为第一个吧！</p>
        </div>
      )}

      {/* Message Form */}
      {!userId ? (
        <div className="text-center py-6 bg-primary-50 rounded-xl">
          <p className="text-gray-600">
            请 <Link to="/auth" className="text-accent visited:text-accent hover:text-accent-hover font-medium transition-all duration-300 ease-expo-out hover:-translate-y-0.5" prefetch="intent">登录</Link> 后发表留言
          </p>
        </div>
      ) : (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <fetcher.Form method="post" className="space-y-4" onSubmit={handleFormSubmit}>
            {currentUserName && (
              <p className="text-sm text-gray-500">
                已登录为 <span className="font-medium text-purple-600">{currentUserName}</span>
              </p>
            )}
            <div className="relative">
              <textarea
                name="content"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-300 ease-expo-out"
                placeholder="请耐心等待审核"
                rows={3}
                required
              />
              <button
                type="button"
                className="emoji-trigger absolute bottom-3 right-3 text-xl hover:scale-110 transition-transform duration-300 ease-expo-out"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="添加表情"
              >
                😊
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 animate-scale-in">
                  <div className="text-sm text-gray-600 mb-2">选择表情</div>
                  <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                    {getCurrentPageEmojis().map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-all duration-300 ease-expo-out hover:scale-110"
                        onClick={() => addEmoji(emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {totalEmojiPages > 1 && (
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <button
                        type="button"
                        className="px-2 py-1 text-gray-600 disabled:opacity-50"
                        onClick={() => setEmojiPage(Math.max(0, emojiPage - 1))}
                        disabled={emojiPage === 0}
                      >
                        ←
                      </button>
                      <span className="text-gray-500">
                        {emojiPage + 1}/{totalEmojiPages}
                      </span>
                      <button
                        type="button"
                        className="px-2 py-1 text-gray-600 disabled:opacity-50"
                        onClick={() => setEmojiPage(Math.min(totalEmojiPages - 1, emojiPage + 1))}
                        disabled={emojiPage === totalEmojiPages - 1}
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="relative bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    发送中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    发送留言
                  </span>
                )}
              </button>
            </div>
          </fetcher.Form>
        </div>
      )}
    </div>
  )
}
