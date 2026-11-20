<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

# pizza-baba-client

Next.js 16 (App Router), React 19, plain JS (`jsconfig.json`, no TypeScript), Tailwind CSS v4, shadcn/ui, Better Auth + MongoDB Atlas. Single package, no workspaces. Lockfile is `package-lock.json` — use `npm`.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — `next build`
- `npm start` — production server (`next start`)
- `npm run lint` — ESLint (flat config, extends `eslint-config-next/core-web-vitals`)
- No `test` script and no test runner installed — do not run `npm test`. Local verification is `lint -> build`

## Environment

- `.env` is required and gitignored (`.env*` in `.gitignore`) — a local copy already exists on disk; never commit it
- Vars: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `MONGODB_URL` (MongoDB Atlas, credentials embedded), `IMGBB_API_KEY` (menu image uploads — empty by default, so uploads fail until set), `NEXT_PUBLIC_API_URL` (http://localhost:5000)

## Auth & database

- `src/lib/auth.js`: Better Auth instance + MongoDB adapter; exports `db` (database `pizza-baba`) and `auth`
- Roles: `customer` | `vendor` | `admin`, enforced on user creation via `databaseHooks`
- `src/app/api/auth/[...all]/route.js` mounts Better Auth at `/api/auth`
- Vendor APIs under `src/app/api/vendor/*` are guarded by `requireVendor` / `requireUser` / `getSessionUser` from `src/lib/vendor.js`
- `scripts/seed-vendor.mjs`: one-off seed of menu items + orders for vendor `vikram@example.com` — run `node scripts/seed-vendor.mjs`; requires the vendor user to already exist in MongoDB and a live Atlas connection

## Layout conventions

- Alias `@/*` → `./src/*`; shadcn aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks` (`components.json`)
- App Router: `src/app/layout.js` (root), `src/app/page.js` (home, client), `dashboard/` (customer/vendor/admin), `SignIn/`, `SignUp/`, `Browse-Menu/`, `menu/`
- No TypeScript: files are `.js`/`.jsx` (`tsx: false` in `components.json`) — don't introduce TS
- CSS: Tailwind v4 in `src/app/globals.css`; no `tailwind.config.js`
- `next/image` remote patterns: `images.unsplash.com`, `pixabay.com`, `cdn.pixabay.com`

## Gotchas

- `src/lib/auth-client.js` reads `process.env.BETTER_AUTH_UR` (typo, missing "L") — client-side session base URL won't resolve from `BETTER_AUTH_URL`; check this first if client auth breaks
- `next.config.mjs` enables `reactCompiler` (React Compiler), `cacheComponents`, `partialPrefetching`; Tailwind is processed via `@tailwindcss/turbopack`
- No CI workflows, pre-commit, or `.github` config in this repo
