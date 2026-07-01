<<<<<<< HEAD
import { z } from 'zod';
import { AlertType, AlertStatus } from './alerts.types';

export const createAlertSchema = z.object({
  transactionId: z.string().min(1),
  type: z.nativeEnum(AlertType),
  riskScore: z.number().min(0).max(100),
  triggeredRules: z.array(z.string()).default([]),
  description: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(AlertStatus),
  assignedTo: z.string().optional(),
  resolution: z.string().optional(),
});

export type CreateAlertDto = z.infer<typeof createAlertSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
=======
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
>>>>>>> upstream/main
