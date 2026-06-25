// Shared types/constants with zero server-only dependencies (no Redis, no Prisma),
// safe to import as a runtime value from client components.
export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number }

export const CHART_RANGES = ['1H', '1D', '1W', '1M', '1Y', 'All'] as const
export type ChartRange = (typeof CHART_RANGES)[number]
