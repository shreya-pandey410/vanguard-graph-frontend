import { execSync } from 'child_process'
import { getPrismaClient } from '../config/postgres'
import { logger } from '../config/logger'

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    logger.error('reset-dev should not be run in production')
    process.exit(1)
  }

  logger.info('Resetting development database...')

  const prisma = await getPrismaClient()

  logger.info('Dropping all tables...')
  await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
  logger.info('Tables dropped')

  logger.info('Running Prisma migrations...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  logger.info('Migrations complete')

  logger.info('Running seeds...')
  const { seedMerchants } = await import('../seeds/merchants.seed')
  const { seedFraudCases } = await import('../seeds/fraud-cases.seed')
  await seedMerchants()
  await seedFraudCases()

  logger.info('Dev reset complete')
  process.exit(0)
}

main().catch((err) => {
  logger.error('Reset failed', { error: err })
  process.exit(1)
})
