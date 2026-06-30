export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export const MERCHANT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  UNDER_REVIEW: 'under_review',
  BLOCKED: 'blocked',
} as const

export const ALERT_STATUS = {
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

export const WORKFLOW_TYPES = {
  MERCHANT_ONBOARDING: 'merchant-onboarding',
  PAYOUT_CHANGE: 'payout-change',
} as const
