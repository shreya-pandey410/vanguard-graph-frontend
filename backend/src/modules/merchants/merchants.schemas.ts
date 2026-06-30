<<<<<<< HEAD
import { z } from 'zod';
import { MerchantCategory } from './merchants.types';

export const createMerchantSchema = z.object({
  merchantId: z.string().min(1, 'merchantId required'),
  name: z.string().min(1, 'name required'),
  category: z.nativeEnum(MerchantCategory),
  country: z.string().length(2, 'country must be a 2-letter ISO code'),
});

export const updateRiskSchema = z.object({
  flaggedDelta: z.number().int().nonnegative().optional(),
  totalDelta: z.number().int().nonnegative().optional(),
});

// TS types inko schema se hi infer kar le — single source of truth
export type CreateMerchantDto = z.infer<typeof createMerchantSchema>;
export type UpdateRiskDto = z.infer<typeof updateRiskSchema>;
=======
import { z } from 'zod'
import { PAGINATION, MERCHANT_STATUS, RISK_LEVELS } from '../../shared/constants'

export const CreateMerchantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  deviceFingerprint: z.string().min(1, 'Device fingerprint is required'),
  ipAddress: z.string().ip({ version: 'v4', message: 'Invalid IPv4 address' }),
  bankAccountNumber: z.string().min(1, 'Bank account number is required'),
  bankAccountIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
})

export const UpdateMerchantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional(),
  deviceFingerprint: z.string().min(1).optional(),
  ipAddress: z.string().ip({ version: 'v4' }).optional(),
  bankAccountNumber: z.string().min(1).optional(),
  bankAccountIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(),
  status: z.enum([MERCHANT_STATUS.PENDING, MERCHANT_STATUS.APPROVED, MERCHANT_STATUS.UNDER_REVIEW, MERCHANT_STATUS.BLOCKED]).optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
  riskLevel: z.enum([RISK_LEVELS.LOW, RISK_LEVELS.MEDIUM, RISK_LEVELS.HIGH]).optional(),
})

export const PayoutChangeSchema = z.object({
  newBankAccountNumber: z.string().min(1, 'New bank account number is required'),
  newBankAccountIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  reason: z.string().min(1, 'Reason is required').max(500),
})

export const MerchantQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  status: z.enum([MERCHANT_STATUS.PENDING, MERCHANT_STATUS.APPROVED, MERCHANT_STATUS.UNDER_REVIEW, MERCHANT_STATUS.BLOCKED]).optional(),
  riskLevel: z.enum([RISK_LEVELS.LOW, RISK_LEVELS.MEDIUM, RISK_LEVELS.HIGH]).optional(),
  search: z.string().optional(),
})
>>>>>>> upstream/main
