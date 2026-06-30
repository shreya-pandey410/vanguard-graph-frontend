import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { getRedisClient } from '../config/redis'
import { env } from '../config/env'

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' },
  },
  store: env.NODE_ENV === 'production'
    ? (new (RedisStore as any)({ sendCommand: (...args: string[]) => (getRedisClient() as any).call(...args) }) as any)
    : undefined,
})
