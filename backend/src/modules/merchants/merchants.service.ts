<<<<<<< HEAD
import { MerchantsRepository } from './merchants.repository';
import {
  Merchant,
  MerchantRiskLevel,
  MerchantRiskProfile,
  CreateMerchantInput,
} from './merchants.types';
import { randomUUID } from 'crypto';

export class MerchantsService {
  constructor(private readonly repo: MerchantsRepository) {}

  async create(input: CreateMerchantInput): Promise<Merchant> {
    const now = new Date().toISOString();
    const merchant: Merchant = {
      id: randomUUID(),
      merchantId: input.merchantId,
      name: input.name,
      category: input.category,
      country: input.country,
      riskLevel: MerchantRiskLevel.LOW,
      totalTransactions: 0,
      flaggedTransactions: 0,
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.create(merchant);
  }

  async getByMerchantId(merchantId: string): Promise<Merchant> {
    const merchant = await this.repo.findByMerchantId(merchantId);
    if (!merchant) throw new Error(`Merchant ${merchantId} not found`);
    return merchant;
  }

  async getAll(): Promise<Merchant[]> {
    return this.repo.findAll();
  }

  // Risk profile compute kar — flagged ratio ke hisaab se level decide
  async getRiskProfile(merchantId: string): Promise<MerchantRiskProfile> {
    const m = await this.getByMerchantId(merchantId);
    const flaggedRatio = m.totalTransactions === 0 ? 0 : m.flaggedTransactions / m.totalTransactions;

    return {
      merchantId: m.merchantId,
      name: m.name,
      riskLevel: this.computeRiskLevel(flaggedRatio),
      totalTransactions: m.totalTransactions,
      flaggedTransactions: m.flaggedTransactions,
      flaggedRatio: Number(flaggedRatio.toFixed(4)),
    };
  }

  // Naye transaction ke baad counters update kar
  async recordTransaction(merchantId: string, flagged: boolean): Promise<void> {
    const m = await this.getByMerchantId(merchantId);
    const newFlagged = m.flaggedTransactions + (flagged ? 1 : 0);
    const newTotal = m.totalTransactions + 1;
    const ratio = newFlagged / newTotal;

    await this.repo.incrementCounters(
      merchantId,
      1,
      flagged ? 1 : 0,
      this.computeRiskLevel(ratio),
    );
  }

  private computeRiskLevel(flaggedRatio: number): MerchantRiskLevel {
    if (flaggedRatio >= 0.2) return MerchantRiskLevel.HIGH;
    if (flaggedRatio >= 0.05) return MerchantRiskLevel.MEDIUM;
    return MerchantRiskLevel.LOW;
  }
}
=======
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
>>>>>>> upstream/main
