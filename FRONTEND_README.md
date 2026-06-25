Frontend scaffold — Next.js 15 + TypeScript + Tailwind

Quick start

1. Install dependencies (pnpm recommended, npm/yarn also supported):

```bash
pnpm install
pnpm dev
```

Environment

- Ensure you have Node 18+ and a package manager.

What I scaffolded

- `app/` — Next.js app router with `layout.tsx` and a dashboard `page.tsx`
- `components/` — `NavBar` and `TradeTerminal` placeholders
- Tailwind + PostCSS config
- `package.json` and `tsconfig.json`

Next steps I can do now

- Add Shadcn component system and design tokens
- Integrate authentication (WebAuthn + TOTP)
- Add API routes and connect to Prisma/Postgres
