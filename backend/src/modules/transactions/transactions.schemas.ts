import { z } from "zod";

export const createTransactionSchema = z.object({
  accountId: z.string(),
  merchantId: z.string(),
  amount: z.number(),
  currency: z.string(),
  ipAddress: z.string(),
  deviceId: z.string(),
  bankAccountId: z.string(),
  timestamp: z.string().optional(),
});

export type CreateTransactionSchema =
    z.infer<typeof createTransactionSchema>;