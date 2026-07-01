import { z } from "zod";

export const InvestigatorActionSchema = z.enum(["APPROVE", "REVIEW", "BLOCK"]);
export type InvestigatorAction = z.infer<typeof InvestigatorActionSchema>;

export function parseNextAction(raw: string): InvestigatorAction {
  const cleaned = raw.trim().toUpperCase();
  const result = InvestigatorActionSchema.safeParse(cleaned);
  if (result.success) return result.data;
  // fallback: scan for keyword
  if (cleaned.includes("BLOCK")) return "BLOCK";
  if (cleaned.includes("REVIEW")) return "REVIEW";
  return "APPROVE";
}
