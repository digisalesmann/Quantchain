/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // tiny-secp256k1 (used by lib/wallet.ts for LTC/DOGE address generation) is WASM-backed and
  // loaded eagerly at import time — Vercel's serverless file tracer doesn't pick up the .wasm
  // binary by default, which crashes any route that transitively imports lib/wallet.ts (e.g.
  // login/signup, via lib/auth.ts) before the route's own try/catch ever runs.
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/tiny-secp256k1/**/*.wasm']
  }
}

module.exports = nextConfig
