/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  // tiny-secp256k1 (used by lib/wallet.ts for LTC/DOGE address generation) is WASM-backed.
  // Webpack bundling it into a route's JS chunk rewrites its internal __dirname-relative path
  // to the .wasm file, breaking it at runtime ("ENOENT ... node_modules/tiny-secp256k1/lib/
  // secp256k1.wasm") on Vercel. Marking it (and its dependents) external keeps them as plain
  // require() calls resolved from the real node_modules at runtime instead, where the path
  // resolution — and Vercel's file tracer — both work correctly.
  serverExternalPackages: ['tiny-secp256k1', 'ecpair', 'bitcoinjs-lib'],
  // Even external, automatic file tracing doesn't pick up tiny-secp256k1's .wasm asset (its
  // load path isn't statically analyzable) — force it into every route's bundle explicitly.
  outputFileTracingIncludes: {
    '/**/*': ['./node_modules/tiny-secp256k1/**/*.wasm']
  }
}

module.exports = nextConfig
