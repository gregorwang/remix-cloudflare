import { Link } from "@remix-run/react"


const footerSections = [
  {
    title: "产品",
    links: [
      { name: "影像记忆", href: "/gallery" },
      { name: "音乐之旅", href: "/music" },
      { name: "游戏世界", href: "/game" },
      { name: "RAG-Nemesis", href: "/chat" },
      { name: "动漫回", href: "/anime" },
    ],
  },
  {
    title: "法律",
    links: [{ name: "法律声明", href: "/terms" }],
  },
  {
    title: "技术支持",
    links: [
      { name: "supbase", href: "https://supabase.com" },
      { name: "tailwindcss", href: "https://tailwindcss.com" },
      { name: "cloudflare", href: "https://cloudflare.com" },
      { name: "remix", href: "https://remix.run" },
      { name: "better-auth", href: "https://better-auth.com" },
      { name: "网易云音乐", href: "https://music.163.com/" },
      { name: "歌词下载支持", href: "https://github.com/ludoux/LrcHelper" },
    ],
  },
  {
    title: "联系",
    links: [
      { name: "github", href: "https://github.com/gregorwang/remix" },
      { name: "gregorwang@wangjiajun.asia", href: "https://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=gregorwang@wangjiajun.asia" },
    ],
  },
]

export default function Footer() {
  
  return (
    <footer className="bg-background border-t border-border">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 ease-expo-out hover:translate-x-0.5"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 ease-expo-out hover:translate-x-0.5"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left - Copyright and Compliance */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-muted-foreground">
              <span>© 2025 汪家俊的个人网站, Inc. All rights reserved.</span>
              <span className="hidden sm:inline">·</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-all duration-300 ease-expo-out hover:translate-x-0.5"
              >
                鄂ICP备2025114987号
              </a>
            </div>

            
          </div>
        </div>
      </div>
    </footer>
  )
}
