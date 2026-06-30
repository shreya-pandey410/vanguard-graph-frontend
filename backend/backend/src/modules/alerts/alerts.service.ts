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
