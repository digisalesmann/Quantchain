import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined
}

const redis = global.redis || new Redis(REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 2 })

if (process.env.NODE_ENV !== 'production') global.redis = redis

export default redis

export function createSubscriber() {
  return new Redis(REDIS_URL)
}
