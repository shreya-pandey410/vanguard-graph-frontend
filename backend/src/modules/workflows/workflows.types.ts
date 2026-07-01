import { z } from "zod";

export const MerchantEventSchema = z.object({
  merchantId: z.string().min(1),
  businessName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  deviceFingerprint: z.string().min(1),
  ipAddress: z.string().min(1),
  bankAccountNumber: z.string().min(1),
  bankRoutingNumber: z.string().min(1),
  eventType: z.enum(["ONBOARDING", "PAYOUT_CHANGE"]).default("ONBOARDING"),
  timestamp: z.string().default(() => new Date().toISOString()),
});

export type MerchantEventInput = z.infer<typeof MerchantEventSchema>;
