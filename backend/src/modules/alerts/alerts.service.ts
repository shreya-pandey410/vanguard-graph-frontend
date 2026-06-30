<<<<<<< HEAD
import { AlertsRepository } from './alerts.repository';
import {
  Alert,
  AlertSeverity,
  AlertStatus,
  CreateAlertInput,
  AlertFilters,
} from './alerts.types';
import { randomUUID } from 'crypto';

export class AlertsService {
  constructor(private readonly repo: AlertsRepository) {}

  async create(input: CreateAlertInput): Promise<Alert> {
    const now = new Date().toISOString();
    const alert: Alert = {
      id: randomUUID(),
      transactionId: input.transactionId,
      type: input.type,
      severity: this.deriveSeverity(input.riskScore),
      status: AlertStatus.OPEN,
      riskScore: input.riskScore,
      triggeredRules: input.triggeredRules,
      description: input.description ?? this.defaultDescription(input),
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.save(alert);
  }

  async getById(id: string): Promise<Alert> {
    const alert = await this.repo.findById(id);
    if (!alert) throw new Error(`Alert ${id} not found`);
    return alert;
  }

  async getAll(filters: AlertFilters = {}): Promise<Alert[]> {
    return this.repo.findAll(filters);
  }

  // Status update — analyst assign kare, resolve/dismiss kare
  async updateStatus(
    id: string,
    status: AlertStatus,
    assignedTo?: string,
    resolution?: string,
  ): Promise<Alert> {
    const alert = await this.getById(id);

    // Already-closed alert ko dobara modify mat hone de
    if (alert.status === AlertStatus.RESOLVED || alert.status === AlertStatus.DISMISSED) {
      throw new Error(`Alert ${id} is already ${alert.status} and cannot be changed`);
    }

    alert.status = status;
    alert.updatedAt = new Date().toISOString();
    if (assignedTo !== undefined) alert.assignedTo = assignedTo;
    if (resolution !== undefined) alert.resolution = resolution;

    return this.repo.save(alert);
  }

  private deriveSeverity(riskScore: number): AlertSeverity {
    if (riskScore >= 90) return AlertSeverity.CRITICAL;
    if (riskScore >= 70) return AlertSeverity.HIGH;
    if (riskScore >= 40) return AlertSeverity.MEDIUM;
    return AlertSeverity.LOW;
  }

  private defaultDescription(input: CreateAlertInput): string {
    return `${input.type} on transaction ${input.transactionId} (risk ${input.riskScore}). Rules: ${input.triggeredRules.join(', ') || 'none'}`;
  }
}
=======
import { AlertsRepository } from './alerts.repository'
import { Alert, AlertQuery, UpdateAlertStatusDTO } from './alerts.types'
import { NotFoundError } from '../../shared/errors'

export class AlertsService {
  constructor(private repository: AlertsRepository) {}

  async getAlerts(query: AlertQuery) {
    return this.repository.findAll(query)
  }

  async getAlertById(id: string): Promise<Alert> {
    const alert = await this.repository.findById(id)
    if (!alert) {
      throw new NotFoundError('Alert')
    }
    return alert
  }

  async updateAlertStatus(id: string, dto: UpdateAlertStatusDTO): Promise<Alert> {
    const alert = await this.repository.findById(id)
    if (!alert) {
      throw new NotFoundError('Alert')
    }
    return this.repository.updateStatus(id, dto)
  }
}
>>>>>>> upstream/main
