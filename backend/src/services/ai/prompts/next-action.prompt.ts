import { RiskScore, RiskFactor } from "../../../workflows/shared/workflow-events";

export function buildNextActionPrompt(riskScore: RiskScore): string {
  return `Given a fraud risk score of ${riskScore.total}/100 (${riskScore.level}) with these factors:
${riskScore.breakdown.map((f: RiskFactor) => `- ${f.factor}: ${f.evidence}`).join("\n")}

Recommend exactly one of: APPROVE, REVIEW, or BLOCK.
Respond with only the action word, nothing else.`;
}
