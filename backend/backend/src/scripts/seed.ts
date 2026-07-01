import { getPrismaClient } from '../config/postgres'
import { logger } from '../config/logger'
import { seedMerchants } from '../seeds/merchants.seed'
import { seedFraudCases } from '../seeds/fraud-cases.seed'

async function main(): Promise<void> {
  await getPrismaClient()
  logger.info('Starting seed...')

  await seedMerchants()
  await seedFraudCases()

  logger.info('Seeding complete')
  process.exit(0)
}

main().catch((err) => {
  logger.error('Seeding failed', { error: err })
  process.exit(1)
})
