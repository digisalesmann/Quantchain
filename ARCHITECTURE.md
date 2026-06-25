Architecture Overview — Enterprise Crypto Exchange

Goals
- Minimalist, premium, mobile-first UI with high performance and scalability.
- Secure custody and non-custodial multi-chain wallets.
- Real-time matching engine and order books supporting high throughput.
- Modular microservices for isolation, scaling, and security.

High-level Components
- Frontend: Next.js 15 + React + TypeScript + TailwindCSS + Shadcn UI + Framer Motion
  - Server-side rendering (app router), edge functions for low-latency endpoints, i18n, theming, and PWA support.
- Backend API: Node.js (TypeScript) with a thin API gateway and multiple microservices:
  - Auth Service: WebAuthn (Passkeys), TOTP 2FA, account/session/device management, rate-limiting
  - User Service: profiles, KYC, AML flags, referrals
  - Trading Gateway: REST + WebSocket endpoints for markets, orders, order-book snapshots
  - Matching Engine: low-latency, in-memory order matching service with persistence events to Postgres and event bus
  - Wallet Service: multi-chain wallets, deposit/withdrawal processing, on-chain watchtowers, hot/cold segregation, HSM integration
  - Settlement Service: internal transfers, balances reconciliation, fiat on/off-ramp adapters
  - Staking Service: staking products, rewards, lockups
  - P2P & Escrow Service: listings, escrow fund flows, dispute resolution
  - Merchant & Payments: payment gateway, merchant dashboard, API keys, invoices
  - Admin & Compliance: KYC review workflow, AML monitoring, case management, audit trails
  - Notification Service: real-time push, email, SMS, in-app
  - Analytics & Market Data: price aggregation, OHLCV, market depth, historical trades

Data & Messaging
- Primary DB: PostgreSQL (Prisma ORM) for authoritative relational data, ACID where required.
- Cache/Realtime: Redis for pub/sub, cache, rate-limits, and lightweight streams.
- Event Bus: Kafka or Redis streams for events (orders, trades, deposits); start with Redis Streams, migrate to Kafka if needed.
- Time-series: ClickHouse or TimescaleDB for high-volume market and trade analytics (optional).

Security & Compliance
- Authentication: OAuth2 for API, WebAuthn for passkeys, TOTP for 2FA, device and session management, JWT + refresh tokens stored securely (HttpOnly, SameSite).
- Secrets & Keys: HSM or cloud KMS for signing withdrawals and custodial operations.
- KYC/AML: Integrate third-party providers (Jumio/Onfido) with webhooks; AML rules run in batch and streaming mode; risk scoring and alerting.
- Infrastructure: Private subnets for DBs, least-privilege IAM, audit logs, WAF, DDoS protection.

Real-time Architecture
- WebSocket gateway fronts real-time clients.
- Matching engine publishes order/trade events to Redis Streams/Kafka.
- Order-book service consumes events and broadcasts deltas to subscribed clients via Redis pub/sub.
- Use incremental snapshots + diffs for efficient book updates.

Scaling
- Stateless services horizontally scalable behind API gateway / ingress.
- Matching engine scaled via sharding markets across instances.
- Read replicas for Postgres; use connection pooling (PgBouncer).
- Use Redis Cluster for scaling pub/sub.

Deployment & Observability
- Infrastructure as Code: Terraform for cloud infra, Helm charts for K8s apps.
- Deploy on Kubernetes (managed EKS/GKE/AKS) with HPA, pod anti-affinity, node pools.
- Monitoring: Prometheus + Grafana, tracing with Jaeger/OpenTelemetry, centralized logging (ELK or Loki).
- CI/CD: GitHub Actions or GitLab CI; run unit, integration, and e2e tests, container image scanning, infra plan approvals.

Data Flow Example: Spot Order
1. Client submits order to Trading Gateway (REST or WS) -> validated, risk-checks, balance reservations.
2. Trading Gateway enqueues order into Matching Engine via event bus.
3. Matching Engine executes match, emits trade event, persists order/trade to Postgres.
4. Settlement Service consumes trade event, updates user balances atomically and emits ledger entries.
5. Notification & Analytics services consume events for user UI and dashboards.

API Surface (high-level groups)
- /api/auth/* — login, logout, refresh, passkeys, 2FA, sessions
- /api/users/* — profile, device, KYC status, referrals
- /api/wallets/* — addresses, balances, deposits, withdrawals, internal-transfer
- /api/markets/* — markets, orderbook, tickers, candles
- /api/orders/* — place, cancel, fetch orders, trade history
- /api/staking/* — stake, unstake, rewards
- /api/p2p/* — listings, escrow actions
- /api/merchant/* — invoices, payouts, merchant settings
- /api/admin/* — KYC review, AML, user management, audits
- /api/notifications/* — subscriptions, alerts
- /api/analytics/* — portfolio, market analytics, reports
- /api/dev/* — API key management, rate limits, usage

Next steps
- Create initial Next.js scaffold with authentication hooks, theming, and a lightweight dashboard.
- Implement Prisma models and migrations for core domain objects (users, wallets, markets, orders, trades).