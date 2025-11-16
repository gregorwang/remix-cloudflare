# CSS 命名规范快速参考

> **快速查阅指南** - 适用于日常开发

---

## 🎯 核心原则

1. **Utility-First** - 优先使用 Tailwind classes
2. **语义化命名** - 描述用途而非样式
3. **简洁明了** - 避免过长的类名
4. **一致性** - 遵循统一的命名模式

---

## 📦 命名模式

### 1. Tailwind Utility Classes (优先使用)

```tsx
// ✅ 好的实践 - 直接使用 Tailwind
<div className="flex items-center gap-4 p-6 bg-primary-50 rounded-xl">
  <span className="text-accent hover:text-accent-hover transition-colors">
    Hello
  </span>
</div>
```

### 2. BEM 简化版 (组件样式)

**格式**: `.block__element--modifier`

```css
/* 组件 */
.music-card { }

/* 元素 */
.music-card__title { }
.music-card__image { }
.music-card__button { }

/* 修饰符 */
.music-card--featured { }
.music-card--loading { }
```

**使用示例**:

```tsx
<div className="music-card music-card--featured">
  <h2 className="music-card__title">标题</h2>
  <img className="music-card__image" src="..." />
  <button className="music-card__button">播放</button>
</div>
```

### 3. 前缀命名系统

| 前缀 | 用途 | 示例 |
|------|------|------|
| `.is-` | 状态类 | `.is-active`, `.is-loading` |
| `.has-` | 包含关系 | `.has-error`, `.has-children` |
| `.glass-` | 玻璃态效果 | `.glass-light`, `.glass-strong` |
| `.scrollbar-` | 滚动条 | `.scrollbar-hide`, `.scrollbar-minimal` |
| `.animate-` | 动画效果 | `.animate-shimmer`, `.animate-float` |
| `.gpu-` | 性能优化 | `.gpu-accelerated` |

**示例**:

```tsx
<div className={`music-player ${isPlaying ? 'is-playing' : ''}`}>
  <div className="glass-light animate-shimmer">
    播放器
  </div>
</div>
```

---

## ✅ 推荐的命名

### 组件命名

```css
/* ✅ 好 - 描述组件功能 */
.hero-section { }
.navigation-menu { }
.feature-card { }
.testimonial-slider { }

/* ❌ 差 - 描述样式 */
.big-blue-box { }
.red-text { }
.flex-container { }
```

### 布局命名

```css
/* ✅ 好 */
.page-wrapper { }
.content-container { }
.sidebar-nav { }
.footer-links { }

/* ❌ 差 */
.wrapper { } /* 太通用 */
.container1 { } /* 无语义 */
.div-main { } /* 描述标签而非功能 */
```

### 效果命名

```css
/* ✅ 好 - 描述效果 */
.glass-effect { }
.gradient-overlay { }
.shadow-elevated { }

/* ❌ 差 */
.effect-1 { }
.style-a { }
```

---

## ⛔ 避免的命名

### 1. 过长的类名

```css
/* ❌ 避免 */
.music-player-container-card-title-text-wrapper { }

/* ✅ 简化 */
.music-card__title { }
```

### 2. 无语义的缩写

```css
/* ❌ 避免 */
.mc { } /* music-card? main-container? */
.txt-pri { } /* text-primary? */
.btn-grn { } /* button-green? */

/* ✅ 使用完整单词或通用缩写 */
.music-card { }
.text-primary { }
.btn-success { } /* 通用约定 */
```

### 3. 样式描述类名

```css
/* ❌ 避免 - 描述样式 */
.red-text { }
.margin-top-20 { }
.float-left { }

/* ✅ 使用 Tailwind 或语义化命名 */
.text-red-500 { } /* Tailwind */
.mt-5 { } /* Tailwind */
.error-message { } /* 语义化 */
```

### 4. 数字后缀

```css
/* ❌ 避免 */
.card1 { }
.card2 { }
.section-style-3 { }

/* ✅ 使用修饰符 */
.card--primary { }
.card--secondary { }
.section--featured { }
```

---

## 🎨 特殊场景命名

### 1. 响应式修饰符

```tsx
{/* ✅ Tailwind 响应式 */}
<div className="text-sm md:text-base lg:text-lg">
  响应式文本
</div>
```

### 2. 状态修饰符

```tsx
{/* ✅ 条件类名 */}
<button
  className={`btn ${isLoading ? 'is-loading' : ''} ${isDisabled ? 'is-disabled' : ''}`}
>
  提交
</button>

{/* ✅ 使用 clsx/classnames */}
import { clsx } from 'clsx';

<button
  className={clsx(
    'btn',
    isLoading && 'is-loading',
    isDisabled && 'is-disabled'
  )}
>
  提交
</button>
```

### 3. 主题变体

```tsx
{/* ✅ Dark mode */}
<div className="bg-primary-50 dark:bg-primary-950">
  <p className="text-primary-950 dark:text-primary-50">
    内容
  </p>
</div>
```

---

## 📚 实际案例

### 案例 1: 音乐卡片组件

```tsx
// ✅ 推荐的结构
<article className="music-card music-card--featured">
  <div className="music-card__image-wrapper">
    <img
      className="music-card__image"
      src="..."
      alt="专辑封面"
    />
  </div>

  <div className="music-card__content">
    <h3 className="music-card__title">歌曲名称</h3>
    <p className="music-card__artist">歌手</p>

    <button className="music-card__play-btn is-active">
      播放
    </button>
  </div>
</article>
```

**CSS**:

```css
@layer components {
  .music-card {
    /* 基础样式 */
  }

  .music-card--featured {
    /* 特色卡片变体 */
  }

  .music-card__image-wrapper {
    /* 图片容器 */
  }

  .music-card__play-btn.is-active {
    /* 活动状态 */
  }
}
```

### 案例 2: 导航菜单

```tsx
// ✅ 清晰的层级结构
<nav className="main-nav">
  <ul className="main-nav__list">
    <li className="main-nav__item main-nav__item--active">
      <a className="main-nav__link" href="/home">
        首页
      </a>
    </li>
    <li className="main-nav__item">
      <a className="main-nav__link" href="/music">
        音乐
      </a>
    </li>
  </ul>
</nav>
```

### 案例 3: 混合使用 Tailwind 和自定义类

```tsx
// ✅ 最佳实践: Tailwind + 自定义组件类
<div className="glass-light p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
  <h2 className="text-2xl font-bold text-primary-950 mb-4">
    标题
  </h2>

  {/* 使用自定义组件类处理特殊效果 */}
  <div className="stellar-text animate-shimmer">
    特殊文字效果
  </div>

  {/* 使用 Tailwind 处理常规布局 */}
  <div className="flex items-center gap-4 mt-6">
    <button className="px-4 py-2 bg-accent hover:bg-accent-hover rounded">
      按钮
    </button>
  </div>
</div>
```

---

## 🔍 命名决策流程图

```
需要添加样式
    ↓
是简单的单一样式吗? (颜色、间距、字体等)
    ↓ 是
使用 Tailwind utility class
    ↓
    ✅ 完成

    ↓ 否
是可复用的组件吗?
    ↓ 是
使用 BEM 命名 + @layer components
    ↓
    ✅ 完成

    ↓ 否
是页面特有的复杂样式吗?
    ↓ 是
创建页面 CSS 文件,使用语义化命名
    ↓
    ✅ 完成

    ↓ 否
检查是否可以使用 shared/ 目录中的共享样式
    ↓
    ✅ 完成
```

---

## 📋 检查清单

在命名 CSS 类之前,问自己:

- [ ] 这个名称清楚地描述了功能或用途吗?
- [ ] 是否可以用 Tailwind utility class 代替?
- [ ] 名称是否足够简洁(少于3个单词)?
- [ ] 是否遵循了项目的命名约定?
- [ ] 团队其他成员能理解这个名称吗?
- [ ] 是否与现有类名保持一致的风格?

---

## 🛠️ 工具推荐

### VS Code 扩展

- **Tailwind CSS IntelliSense** - 自动补全 Tailwind classes
- **CSS Peek** - 快速查看类定义
- **Headwind** - 自动排序 Tailwind classes

### 在线工具

- [BEM Naming Tool](http://getbem.com/naming/)
- [CSS Stats](https://cssstats.com/) - 分析 CSS 使用情况
- [Specificity Calculator](https://specificity.keegan.st/) - 计算选择器权重

---

## 📖 更多参考

详细架构说明请查看: [CSS_ARCHITECTURE.md](../CSS_ARCHITECTURE.md)

---

**快速记忆口诀**:

> **Utility 优先,语义明了**
> **BEM 结构,层级清晰**
> **前缀统一,状态分明**
> **避免缩写,简洁为王**

---

**最后更新**: 2025-01-14
