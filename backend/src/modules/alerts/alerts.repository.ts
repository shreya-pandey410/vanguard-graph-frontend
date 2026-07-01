<<<<<<< HEAD
import driver from '../../config/neo4j';
import { Alert, AlertFilters } from './alerts.types';

export class AlertsRepository {
  async save(alert: Alert): Promise<Alert> {
    const session = driver.session();
    try {
      await session.run(
        `MERGE (a:Alert { id: $id })
         SET a.transactionId  = $transactionId,
             a.type           = $type,
             a.severity       = $severity,
             a.status         = $status,
             a.riskScore      = $riskScore,
             a.triggeredRules = $triggeredRules,
             a.description    = $description,
             a.assignedTo     = $assignedTo,
             a.resolution     = $resolution,
             a.createdAt      = $createdAt,
             a.updatedAt      = $updatedAt`,
        {
          ...alert,
          // optional fields undefined ho sakte hain — Neo4j null pasand karta hai
          assignedTo: alert.assignedTo ?? null,
          resolution: alert.resolution ?? null,
        },
      );
      return alert;
    } finally {
      await session.close();
=======
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
>>>>>>> upstream/main
    }
  }

  async findById(id: string): Promise<Alert | null> {
<<<<<<< HEAD
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Alert { id: $id }) RETURN a LIMIT 1`,
        { id },
      );
      if (result.records.length === 0) return null;
      return this.mapAlert(result.records[0].get('a'));
    } finally {
      await session.close();
    }
  }

  // Filters optional hain — dynamic WHERE banata hai
  async findAll(filters: AlertFilters = {}): Promise<Alert[]> {
    const session = driver.session();
    try {
      const conditions: string[] = [];
      if (filters.status) conditions.push('a.status = $status');
      if (filters.severity) conditions.push('a.severity = $severity');

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await session.run(
        `MATCH (a:Alert) ${where} RETURN a ORDER BY a.createdAt DESC`,
        filters,
      );
      return result.records.map((r) => this.mapAlert(r.get('a')));
    } finally {
      await session.close();
    }
  }

  private mapAlert(node: any): Alert {
    return {
      id: node.properties.id,
      transactionId: node.properties.transactionId,
      type: node.properties.type,
      severity: node.properties.severity,
      status: node.properties.status,
      riskScore: Number(node.properties.riskScore),
      triggeredRules: node.properties.triggeredRules ?? [],
      description: node.properties.description,
      assignedTo: node.properties.assignedTo ?? undefined,
      resolution: node.properties.resolution ?? undefined,
      createdAt: node.properties.createdAt,
      updatedAt: node.properties.updatedAt,
    };
  }
}
=======
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
>>>>>>> upstream/main
