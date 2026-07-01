import { Prisma } from '@prisma/client'
import { prismaClient } from '../../services/db/prisma'
import { Alert, AlertQuery, UpdateAlertStatusDTO } from './alerts.types'

export class AlertsRepository {
  async findAll(query: AlertQuery) {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: Prisma.AlertWhereInput = {}
    if (query.merchantId) where.merchantId = query.merchantId
    if (query.riskLevel) where.riskLevel = query.riskLevel
    if (query.status) where.status = query.status
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
    }

    const [data, total] = await Promise.all([
      prismaClient.alert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { merchant: { select: { name: true, email: true } } },
      }),
      prismaClient.alert.count({ where }),
    ])

    return {
      data: data as unknown as Alert[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: string): Promise<Alert | null> {
    const alert = await prismaClient.alert.findUnique({
      where: { id },
      include: { merchant: { select: { name: true, email: true } } },
    })
    return alert as unknown as Alert | null
  }

  async create(data: {
    merchantId: string
    riskScore: number
    riskLevel: string
    summary: string
  }): Promise<Alert> {
    const alert = await prismaClient.alert.create({ data })
    return alert as unknown as Alert
  }

  async updateStatus(id: string, dto: UpdateAlertStatusDTO): Promise<Alert> {
    const alert = await prismaClient.alert.update({
      where: { id },
      data: { status: dto.status },
    })
    return alert as unknown as Alert
  }
}
