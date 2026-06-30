import Redis from 'ioredis'
import { env } from './env'
import { logger } from './logger'

let redisClient: Redis

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 10) {
        logger.warn('Redis: Max retries reached, giving up')
        return null
      }
      return Math.min(times * 500, 5000)
    },
    lazyConnect: true,
    tls: {},
  })

  client.on('connect', () => logger.info('Redis connected'))
  client.on('error', (err) => logger.warn('Redis connection error', { error: err.message }))
  client.on('close', () => logger.warn('Redis connection closed'))

  return client
}

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient()
  }
  return redisClient
}

export { getRedisClient, redisClient }
