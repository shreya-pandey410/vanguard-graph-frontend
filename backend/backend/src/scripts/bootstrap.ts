import { execSync } from 'child_process'
import { getPrismaClient } from '../config/postgres'
import { logger } from '../config/logger'

async function main(): Promise<void> {
  logger.info('Bootstrapping Vanguard Graph...')

  logger.info('Running Prisma migrations...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  logger.info('Migrations complete')

  await getPrismaClient()

  logger.info('Running seeds...')
  const { seedMerchants } = await import('../seeds/merchants.seed')
  const { seedFraudCases } = await import('../seeds/fraud-cases.seed')
  await seedMerchants()
  await seedFraudCases()

  logger.info('Bootstrap complete')
  process.exit(0)
}

main().catch((err) => {
  logger.error('Bootstrap failed', { error: err })
  process.exit(1)
})
