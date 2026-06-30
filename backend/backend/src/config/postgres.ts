import { PrismaClient } from '@prisma/client'
import { env } from './env'
import { logger } from './logger'

let prismaClient: PrismaClient

async function connectWithRetry(retries = 5, delay = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      prismaClient = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } })
      await prismaClient.$connect()
      logger.info('PostgreSQL connected')
      return
    } catch (error) {
      logger.error(`PostgreSQL connection attempt ${attempt}/${retries} failed`, { error })
      if (attempt === retries) {
        logger.error('All PostgreSQL connection attempts failed')
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

async function getPrismaClient(): Promise<PrismaClient> {
  if (!prismaClient) {
    await connectWithRetry()
  }
  return prismaClient
}

export { getPrismaClient, prismaClient }
