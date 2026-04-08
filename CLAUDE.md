# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # Start dev server (Turbopack, http://localhost:3000)
pnpm build      # Production build (Turbopack)
pnpm start      # Start production server
pnpm lint       # Run ESLint (eslint CLI, not next lint)
```

Type-check without emitting:
```bash
pnpm exec tsc --noEmit
```

There are no tests configured yet.

## Stack

- **Next.js 16.2.2** with App Router — read `node_modules/next/dist/docs/` before making changes
- **React 19.2** (canary features: View Transitions, `useEffectEvent`, Activity)
- **TypeScript 5** — strict mode enabled
- **Tailwind CSS 4** — CSS-based config, no `tailwind.config.js`
- **ESLint 9** flat config in `eslint.config.mjs`
- **pnpm** as package manager

## Architecture

App Router only (`app/` directory). No Pages Router.

- `app/layout.tsx` — root layout; sets Geist fonts via CSS variables, full-height flex body
- `app/page.tsx` — home page (Server Component by default)
- `app/globals.css` — Tailwind entry (`@import "tailwindcss"`), CSS custom properties for light/dark theme colors, `@theme inline` block for mapping CSS vars to Tailwind tokens
- `next.config.ts` — minimal config, Turbopack is on by default
- Path alias: `@/` → project root

## Next.js 16 Breaking Changes

**Async Request APIs (sync access removed):** `cookies()`, `headers()`, `draftMode()`, route `params`, and page `searchParams` must all be `await`ed:

```tsx
// page.tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

Run `pnpm exec next typegen` to generate `PageProps`/`LayoutProps`/`RouteContext` helpers for type-safe async params.

**Turbopack is default** for both `next dev` and `next build`. Custom `webpack` config in `next.config.ts` will break the build — migrate to `turbopack` top-level config or pass `--webpack` to opt out.

**`experimental.turbopack`** moved to top-level `turbopack` in `next.config.ts`.

**Middleware renamed to proxy** — the `middleware` file convention is deprecated; use `proxy` instead.

**`experimental_ppr` Route Segment Config removed** — Partial Prerendering is now stable.

## Tailwind CSS 4

No `tailwind.config.js`. Theme customization goes in CSS via `@theme inline {}` blocks inside `globals.css`. Tilde (`~`) prefix in Sass imports is not supported under Turbopack — use bare package names.

## ESLint 9

Uses flat config (`eslint.config.mjs`) with `defineConfig`. Run via `pnpm lint` which calls `eslint` directly (not `next lint`). Config spreads `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
