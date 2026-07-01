<<<<<<< HEAD
import driver from '../../config/neo4j';
import { Merchant } from './merchants.types';

export class MerchantsRepository {
  async create(merchant: Merchant): Promise<Merchant> {
    const session = driver.session();
    try {
      await session.run(
        `MERGE (m:Merchant { merchantId: $merchantId })
         ON CREATE SET m.id = $id,
                       m.name = $name,
                       m.category = $category,
                       m.country = $country,
                       m.riskLevel = $riskLevel,
                       m.totalTransactions = $totalTransactions,
                       m.flaggedTransactions = $flaggedTransactions,
                       m.createdAt = $createdAt,
                       m.updatedAt = $updatedAt`,
        { ...merchant },
      );
      return merchant;
    } finally {
      await session.close();
    }
  }

  async findByMerchantId(merchantId: string): Promise<Merchant | null> {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (m:Merchant { merchantId: $merchantId }) RETURN m LIMIT 1`,
        { merchantId },
      );
      if (result.records.length === 0) return null;
      return this.mapMerchant(result.records[0].get('m'));
    } finally {
      await session.close();
    }
  }

  async findAll(): Promise<Merchant[]> {
    const session = driver.session();
    try {
      const result = await session.run(`MATCH (m:Merchant) RETURN m ORDER BY m.name`);
      return result.records.map((r) => this.mapMerchant(r.get('m')));
    } finally {
      await session.close();
    }
  }

  // Risk counters update kar — total aur flagged transactions
  async incrementCounters(
    merchantId: string,
    totalDelta: number,
    flaggedDelta: number,
    riskLevel: string,
  ): Promise<void> {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (m:Merchant { merchantId: $merchantId })
         SET m.totalTransactions   = coalesce(m.totalTransactions, 0) + $totalDelta,
             m.flaggedTransactions = coalesce(m.flaggedTransactions, 0) + $flaggedDelta,
             m.riskLevel = $riskLevel,
             m.updatedAt = $updatedAt`,
        {
          merchantId,
          totalDelta,
          flaggedDelta,
          riskLevel,
          updatedAt: new Date().toISOString(),
        },
      );
    } finally {
      await session.close();
    }
  }

  private mapMerchant(node: any): Merchant {
    return {
      id: node.properties.id,
      merchantId: node.properties.merchantId,
      name: node.properties.name,
      category: node.properties.category,
      country: node.properties.country,
      riskLevel: node.properties.riskLevel,
      // Neo4j integers ko Number() se convert kar — warna {low, high} object aata hai
      totalTransactions: Number(node.properties.totalTransactions ?? 0),
      flaggedTransactions: Number(node.properties.flaggedTransactions ?? 0),
      createdAt: node.properties.createdAt,
      updatedAt: node.properties.updatedAt,
    };
  }
}
=======
import { prismaClient } from '../../services/db/prisma'
import { Merchant, CreateMerchantDTO, UpdateMerchantDTO, MerchantQuery, PaginatedResult } from './merchants.types'

export class MerchantsRepository {
  async findAll(query: MerchantQuery): Promise<PaginatedResult<Merchant>> {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (query.status) where.status = query.status
    if (query.riskLevel) where.riskLevel = query.riskLevel
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ]
    }

    const [data, total] = await Promise.all([
      prismaClient.merchant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prismaClient.merchant.count({ where }),
    ])

    return {
      data: data as unknown as Merchant[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: string): Promise<Merchant | null> {
    const merchant = await prismaClient.merchant.findUnique({ where: { id } })
    return merchant as unknown as Merchant | null
  }

  async findByEmail(email: string): Promise<Merchant | null> {
    const merchant = await prismaClient.merchant.findUnique({ where: { email } })
    return merchant as unknown as Merchant | null
  }

  async create(data: CreateMerchantDTO): Promise<Merchant> {
    const merchant = await prismaClient.merchant.create({ data })
    return merchant as unknown as Merchant
  }

  async update(id: string, data: UpdateMerchantDTO): Promise<Merchant> {
    const merchant = await prismaClient.merchant.update({ where: { id }, data })
    return merchant as unknown as Merchant
  }
}
>>>>>>> upstream/main
