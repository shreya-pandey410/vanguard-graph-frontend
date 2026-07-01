import { prismaClient } from '../services/db/prisma'
import { logger } from '../config/logger'

interface AlertSeed {
  merchantEmail: string
  riskScore: number
  riskLevel: string
  status: string
  summary: string
}

const seedAlerts: AlertSeed[] = [
  // HIGH risk alerts from fraud ring merchants
  { merchantEmail: 'rajesh.kumar@example.com', riskScore: 92, riskLevel: 'high', status: 'open', summary: 'Shared device D-773 detected across 5 merchants. Bank account overlaps with known fraud patterns.' },
  { merchantEmail: 'priya.sharma@example.com', riskScore: 88, riskLevel: 'high', status: 'under_review', summary: 'Bank account #4421 shared with 2 other merchants. High velocity of payout changes.' },
  { merchantEmail: 'rahul.mehta@example.com', riskScore: 85, riskLevel: 'high', status: 'open', summary: 'Concentrated IP range 192.168.1.x shared with 3 merchants. Suspicious onboarding pattern.' },
  // MEDIUM risk alerts
  { merchantEmail: 'suresh.patel@example.com', riskScore: 65, riskLevel: 'medium', status: 'open', summary: 'Shares device D-773. Moderate risk profile with recent account activity.' },
  { merchantEmail: 'ananya.gupta@example.com', riskScore: 60, riskLevel: 'medium', status: 'resolved', summary: 'Shared bank account flagged. Reviewed and resolved - documented business relationship.' },
  { merchantEmail: 'sanjay.agarwal@example.com', riskScore: 55, riskLevel: 'medium', status: 'open', summary: 'IP address proximity to known fraud merchants. Further investigation recommended.' },
  { merchantEmail: 'deepak.verma@example.com', riskScore: 58, riskLevel: 'medium', status: 'under_review', summary: 'Device D-773 overlap. Payout change triggered after onboarding.' },
  // LOW risk alerts
  { merchantEmail: 'anita.desai@example.com', riskScore: 15, riskLevel: 'low', status: 'open', summary: 'Minor velocity anomaly in payout patterns.' },
  { merchantEmail: 'vijay.khanna@example.com', riskScore: 10, riskLevel: 'low', status: 'resolved', summary: 'Low risk alert - false positive. No suspicious patterns found.' },
  { merchantEmail: 'kavita.iyer@example.com', riskScore: 20, riskLevel: 'low', status: 'open', summary: 'New merchant with incomplete KYC documents. Routine alert.' },
]

export async function seedFraudCases(): Promise<void> {
  logger.info('Seeding fraud cases...')

  const merchants = await Promise.all(
    seedAlerts.map(a => prismaClient.merchant.findUnique({ where: { email: a.merchantEmail } }))
  )

  for (let i = 0; i < seedAlerts.length; i++) {
    const alert = seedAlerts[i]
    const merchant = merchants[i]
    if (!merchant) {
      logger.warn(`Merchant not found for email: ${alert.merchantEmail}, skipping alert`)
      continue
    }

    await prismaClient.alert.create({
      data: {
        merchantId: merchant.id,
        riskScore: alert.riskScore,
        riskLevel: alert.riskLevel,
        status: alert.status,
        summary: alert.summary,
      },
    })
  }

  logger.info(`Seeded ${seedAlerts.length} alerts`)
}
