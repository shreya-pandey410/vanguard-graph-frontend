import app from './app'
import { env } from './config/env'
import { logger } from './config/logger'
import { getPrismaClient } from './config/postgres'
import { getRedisClient } from './config/redis'

async function main(): Promise<void> {
  logger.info('Starting Vanguard Graph server...')

  await getPrismaClient()
  const redis = getRedisClient()
  try {
    await redis.connect()
  } catch {
    logger.warn('Redis not available, continuing without cache')
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`)
  })

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully...`)
    server.close(async () => {
      logger.info('HTTP server closed')
      process.exit(0)
    })
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  logger.error('Failed to start server', { error: err })
  process.exit(1)
})
