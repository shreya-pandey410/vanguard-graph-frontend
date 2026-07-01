import { z } from 'zod'
import { PAGINATION, RISK_LEVELS, ALERT_STATUS } from '../../shared/constants'

export const AlertQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  merchantId: z.string().optional(),
  riskLevel: z.enum([RISK_LEVELS.LOW, RISK_LEVELS.MEDIUM, RISK_LEVELS.HIGH]).optional(),
  status: z.enum([ALERT_STATUS.OPEN, ALERT_STATUS.UNDER_REVIEW, ALERT_STATUS.RESOLVED, ALERT_STATUS.ESCALATED]).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
})

export const UpdateAlertStatusSchema = z.object({
  status: z.enum([ALERT_STATUS.OPEN, ALERT_STATUS.UNDER_REVIEW, ALERT_STATUS.RESOLVED, ALERT_STATUS.ESCALATED]),
  note: z.string().max(500).optional(),
})
