import { RiskLevel } from "../../../workflows/shared/workflow-events";

export async function callMock(prompt: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 300)); // simulate latency

  if (prompt.includes("Recommend exactly one")) {
    // next-action prompt
    if (prompt.includes("HIGH")) return "BLOCK";
    if (prompt.includes("MEDIUM")) return "REVIEW";
    return "APPROVE";
  }

  if (prompt.includes("fraud ring analyst")) {
    return "The connected entities show coordinated device reuse and shared payout routing, consistent with a merchant fraud ring operating across multiple onboarding events.";
  }

  // Default: risk memo
  const level: RiskLevel = prompt.includes("HIGH")
    ? "HIGH"
    : prompt.includes("MEDIUM")
    ? "MEDIUM"
    : "LOW";

  const actionMap: Record<RiskLevel, string> = {
    HIGH: "This merchant presents a HIGH fraud risk due to shared device fingerprints and payout account overlap with previously flagged entities. The graph traversal reveals second-degree connections to active fraud cases. Immediate action is recommended: Block this merchant and escalate to the fraud ops team for manual review.",
    MEDIUM: "This merchant presents a MEDIUM fraud risk. Several enrichment signals are borderline, and one shared entity was detected in the graph. Recommend sending to manual review before approving payout.",
    LOW: "This merchant presents a LOW fraud risk. No suspicious graph connections or enrichment flags were detected. Recommend Approve with standard monitoring.",
  };

  return actionMap[level];
}
