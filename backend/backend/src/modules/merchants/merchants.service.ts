import { MerchantsRepository } from './merchants.repository'
import { CreateMerchantDTO, UpdateMerchantDTO, MerchantQuery, PaginatedResult, Merchant, PayoutChangeDTO } from './merchants.types'
import { ConflictError, NotFoundError } from '../../shared/errors'
import { logger } from '../../config/logger'

export class MerchantsService {
  constructor(private repository: MerchantsRepository) {}

  async createMerchant(data: CreateMerchantDTO): Promise<Merchant> {
    const existing = await this.repository.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('A merchant with this email already exists')
    }

    const merchant = await this.repository.create(data)

    // TODO: Trigger Naitik's merchant-onboarding Render Workflow
    logger.info('Merchant created, workflow trigger pending', { merchantId: merchant.id })

    return merchant
  }

  async getMerchants(query: MerchantQuery): Promise<PaginatedResult<Merchant>> {
    return this.repository.findAll(query)
  }

  async getMerchantById(id: string): Promise<Merchant> {
    const merchant = await this.repository.findById(id)
    if (!merchant) {
      throw new NotFoundError('Merchant')
    }
    return merchant
  }

  async updateMerchant(id: string, data: UpdateMerchantDTO): Promise<Merchant> {
    const merchant = await this.repository.findById(id)
    if (!merchant) {
      throw new NotFoundError('Merchant')
    }
    return this.repository.update(id, data)
  }

  async triggerPayoutChange(merchantId: string, data: PayoutChangeDTO): Promise<Merchant> {
    const merchant = await this.repository.findById(merchantId)
    if (!merchant) {
      throw new NotFoundError('Merchant')
    }

    const updated = await this.repository.update(merchantId, {
      bankAccountNumber: data.newBankAccountNumber,
      bankAccountIfsc: data.newBankAccountIfsc,
    })

    // TODO: Trigger Naitik's payout-change Render Workflow
    logger.info('Payout change triggered, workflow trigger pending', { merchantId, ...data })

    return updated
  }
}
