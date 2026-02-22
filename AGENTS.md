# Repository Guidelines

## Project Structure & Module Organization
The Remix source lives in `app/`. Route modules and API endpoints are in `app/routes/` (for example, `app/routes/api.image-token.tsx`), shared UI lives in `app/components/`, hooks in `app/hooks/`, server-side services in `app/lib/`, and shared helpers in `app/utils/`. Global styles are defined in `app/tailwind.css`, with additional styles under `app/styles/`. Static assets live in `public/`. Documentation is kept under `docs/`, and ad-hoc scripts under `scripts/`. Build output is written to `build/`. Local SQLite files (`*.db`, `*.db-wal`, `*.db-shm`) are intentionally ignored.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Remix + Vite development server.
- `npm run build`: create a production build in `build/`.
- `npm start`: serve the built app from `build/server/index.js`.
- `npm run lint`: run ESLint checks.
- `npm run typecheck`: run TypeScript `tsc` in no-emit mode.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation, matching existing `app/*.tsx` files. Follow Remix conventions: `_index.tsx` for index routes, `api.*.tsx` for API routes, `.server.ts`/`.server.tsx` for server-only modules, and `.client.tsx` for client-only code. The `~/*` path alias maps to `app/*` (see `tsconfig.json`). Run `npm run lint` before submitting changes.

## Testing Guidelines
No automated test runner is configured yet. Treat `npm run lint` and `npm run typecheck` as the baseline checks. If you introduce tests, add scripts to `package.json` and update this guide with the chosen framework and naming conventions (for example, `*.test.tsx`).

## Commit & Pull Request Guidelines
Commit messages follow a `type: short description` pattern (examples in history include `chore: update gitignore` and `init: clean history`). Pull requests should describe the change, note any user-facing impact, and include screenshots for UI updates. Link related issues when applicable.

## Security & Configuration Tips
Copy `.env.example` to `.env` and set required values (for example, `AUTH_KEY_SECRET` and optional `IMAGE_BASE_URL`). Do not commit secrets or local database files; `.env*` and `*.db*` are gitignored.
