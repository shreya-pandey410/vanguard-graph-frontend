import { Router, Request, Response } from 'express'
import { getRedisClient } from '../config/redis'
import { prismaClient } from '../services/db/prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const checks = {
    postgres: 'disconnected',
    redis: 'disconnected',
  }

  try {
    await prismaClient.$queryRaw`SELECT 1`
    checks.postgres = 'connected'
  } catch {
    checks.postgres = 'disconnected'
  }

  try {
    const redis = getRedisClient()
    await redis.ping()
    checks.redis = 'connected'
  } catch {
    checks.redis = 'disconnected'
  }

  const allOk = checks.postgres === 'connected' && checks.redis === 'connected'

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    ...checks,
    timestamp: new Date().toISOString(),
  })
})

export default router
