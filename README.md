# Remix Cloudflare

基于 Remix + Cloudflare Workers 的个人站点项目，包含内容页面、留言板、聊天 API、媒体安全访问（R2 + Token）和认证能力。

## 技术栈

- Runtime: Cloudflare Workers
- Web: Remix v2 + React 18 + Vite
- Data: Cloudflare D1 (SQLite)
- Rate Limit: Durable Object (`RateLimiterDO`, sqlite-backed)
- Media: Cloudflare R2 + `/api/media` 代理读取
- Auth: `better-auth`
- Style: Tailwind CSS

## 主要能力

- 多页面站点：`/`, `/music`, `/anime`, `/gallery`, `/cv`, `/messages`, `/chat` 等
- 留言板审核流：用户提交 -> 管理后台审核（`/admin/messages`）
- 三层限流：IP 小时限制、用户冷却时间、用户每日上限
- 安全媒体访问：
  - `POST /api/image-token` 生成签名 URL
  - `GET /api/media` 验签后从 R2 返回对象
  - `GET /api/verify-token` 调试 token 有效性

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 配置环境变量

复制 `.env.example` 为 `.env`，至少配置：

```env
AUTH_KEY_SECRET=replace-with-strong-secret
```

可选配置（按需）：

```env
IMAGE_BASE_URL=https://oss.wangjiajun.asia
MEDIA_BASE_URL=https://your-worker-domain
RESEND_API_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3) 本地开发

```bash
npm run dev
```

### 4) 类型检查与构建

```bash
npm run typecheck
npm run build
```

## 常用命令

- `npm run dev`: Remix + Vite 本地开发
- `npm run build`: 生产构建
- `npm start`: 使用 `wrangler dev` 启动 Worker 模式
- `npm run deploy`: 构建并部署到 Cloudflare
- `npm run lint`: ESLint 检查
- `npm run typecheck`: TypeScript 检查
- `npm run d1:migrate:local`: 本地 D1 迁移
- `npm run d1:migrate:remote`: 远程 D1 迁移

## Cloudflare 绑定

见 `wrangler.toml`：

- D1: `DB` -> `app-db`
- Durable Object: `RATE_LIMITER` -> `RateLimiterDO`
- R2: `MEDIA_BUCKET` -> `gregorwang`
- Assets: `ASSETS` -> `build/client`

## 项目结构（核心）

```text
app/
  routes/
    api.chat.tsx
    api.image-token.tsx
    api.media.tsx
    api.verify-token.tsx
    messages.tsx
    admin.messages.tsx
    music.tsx
    anime.tsx
    gallery.tsx
  lib/
    db.server.ts
    auth.server.ts
    rate-limit.server.ts
    rate-limiter-do.ts
  utils/
    imageToken.server.ts
    cloudflare-env.server.ts
worker.ts
wrangler.toml
migrations/
```

## 限流实现说明

留言板和魔法链接限流不是 KV，实现是 Durable Object：

- 入口服务：`app/lib/rate-limit.server.ts`
- DO 实现：`app/lib/rate-limiter-do.ts`
- 留言路由接入：`app/routes/messages.tsx`

## 部署

确保你已登录 Wrangler：

```bash
npm run cf:login
npm run deploy
```

部署成功后默认地址类似：

`https://my-remix-worker.<account>.workers.dev`
