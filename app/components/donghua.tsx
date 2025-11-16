"use client"

import { ReactNode } from "react"
import { Link } from "@remix-run/react"

type Card = {
  title: string
  description: string
  link: string
  contentLabel: ReactNode
}

const cards: Card[] = [
  {
    title: "近两年所观看番剧",
    description: "最近两年看的动漫比大学四年看的还要多，都是非常优秀，令人印象深刻的作品。",
    link: "",
    contentLabel: (
      <div className="w-full text-left text-sm leading-relaxed p-6">
        <ul className="space-y-2 text-primary-950/70">
          <li>败犬女主太多了</li>
          <li>Re0第三季</li>
          <li>凡人修仙传</li>
          <li>金牌得主</li>
          <li>青之箱</li>
          <li>弹珠汽水瓶里的千岁同学</li>
          <li>我心里危险的东西</li>
          <li>灵笼第二季</li>
        </ul>
      </div>
    ),
  },
  {
    title: "年度最佳",
    description: "最近两年看到过最有意思笑的合不拢嘴来的动漫，女主角有点下头，跟男主产生了非常奇妙的化学反应，非常搞笑，但是又极具含蓄，作品的服装搭配也令人耳目一新，最意想不到的是这个作者是一个四五十岁的中年男性，居然能写出如此青春活泼的故事，非常期待第二季。",
    link: "",
    contentLabel: (
      <img 
        src="https://whylookthis.wangjiajun.asia/baiquan.jpg" 
        alt="年度最佳番剧"
        className="max-w-full h-auto rounded-lg"
      />
    ),
  },
  {
    title: "令人铭记的话语",
    description: "",
    link: "",
    contentLabel: (
      <div className="w-full h-full p-6 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xl font-semibold text-primary-950/90">海的那边是敌人</span>
        <span className="text-sm text-primary-950/50">不要把悲伤和痛苦留给别人</span>
        <span className="text-base text-primary-950/70">你这份温柔，迟早会害死你</span>
        <span className="text-xs text-primary-950/40">你把生命当成什么了？</span>
        <span className="text-lg font-semibold text-primary-950/80">不是当上火影才被大家承认</span>
        <span className="text-base text-primary-950/60">而是被承认才当上火影</span>
        <span className="text-sm text-primary-950/55">色彩越少，越能看清重要</span>
        <span className="text-lg font-semibold text-primary-950/85">此身为剑所成</span>
        <span className="text-base text-primary-950/65">下辈子我还会找到你</span>
      </div>
    ),
  },
]

export default function Donghua() {
  return (
    <section className="py-section-md bg-primary-50">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <header className="mb-8 flex flex-col gap-3">
          <h2 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl text-primary-950">纵览番剧</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-primary-950/70">
            记录那些触动心灵的故事，分享那些难以忘怀的瞬间。每一帧画面，都是一段珍贵的回忆。
          </p>
          <div className="mt-4">
            <Link 
              to="/anime"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:shadow-lg bg-accent text-white hover:bg-accent-hover"
            >
              探索完整榜单
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-12">
          {cards.map((card) => (
            <article
              key={card.title}
              className="group flex flex-col justify-between rounded-lg transition-transform duration-300 ease-expo-out hover:-translate-y-1 md:col-span-4 bg-primary-100"
            >
              {/* 文字信息移到上方 */}
              <div className="p-6">
                <h3 className="text-2xl font-semibold leading-tight tracking-tight text-primary-950">{card.title}</h3>
                {card.description && (
                  <p className="mt-3 text-base leading-relaxed text-primary-950/70">{card.description}</p>
                )}
              </div>

              {/* 内容展示区域 - 移除固定高度，让内容自然撑开 */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-center rounded-lg overflow-hidden text-sm bg-primary-100 text-primary-950/60">
                  {card.contentLabel}
                </div>
              </div>

              {/* 链接区域 - 只在有链接时显示 */}
              {card.link && (
                <div className="border-t p-6 border-primary-100/70">
                  <button
                    onClick={() => console.log('Clicked:', card.title)}
                    className="inline-flex items-center gap-0.5 text-sm font-medium transition-transform duration-300 ease-expo-out group-hover:translate-x-0.5 cursor-pointer bg-transparent border-none p-0 text-accent"
                  >
                    {card.link}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
