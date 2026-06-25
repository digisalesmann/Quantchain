Quantchain — Starter Repo

What I added
- ARCHITECTURE.md — high-level architecture and API surface
- prisma/schema.prisma — comprehensive initial Prisma models for core domains

Next steps I can implement for you
- Generate Next.js 15 scaffold with Tailwind, Shadcn UI, and auth hooks
- Add initial API routes and Prisma migrations
- Implement Auth service skeleton (WebAuthn + TOTP)
- Scaffold Matching Engine and Wallet service prototypes

Commands to get started locally (example)

1. Install dependencies (after scaffold created)

```bash
# ensure DATABASE_URL env var
pnpm install
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm dev
```

2. Environment
- Provide `DATABASE_URL` for Postgres
- Provide `REDIS_URL` for Redis
- Provide OAuth / KMS / Web3 provider secrets

If you want, I'll scaffold the Next.js project now (app router, Tailwind, shadcn), then implement the auth flow next. Which should I start with?