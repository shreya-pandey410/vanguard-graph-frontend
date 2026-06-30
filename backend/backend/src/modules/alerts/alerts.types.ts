import { RiskLevel } from '../merchants/merchants.types'

export type AlertStatus = 'open' | 'under_review' | 'resolved' | 'escalated'

export interface Alert {
  id: string
  merchantId: string
  riskScore: number
  riskLevel: RiskLevel
  status: AlertStatus
  summary: string
  investigationId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AlertQuery {
  page?: number
  limit?: number
  merchantId?: string
  riskLevel?: RiskLevel
  status?: AlertStatus
  dateFrom?: string
  dateTo?: string
}

export interface UpdateAlertStatusDTO {
  status: AlertStatus
  note?: string
}
