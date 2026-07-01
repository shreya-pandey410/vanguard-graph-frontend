import { RiskScore, GraphLink, RiskFactor } from "../../../workflows/shared/workflow-events";

export function buildRiskMemoPrompt(params: {
  merchantId: string;
  businessName: string;
  riskScore: RiskScore;
  graphLinks: GraphLink[];
  enrichmentSummary: string;
}): string {
  const { merchantId, businessName, riskScore, graphLinks, enrichmentSummary } = params;

  const linkSummary = graphLinks
    .map((l) => `- ${l.fromType} ${l.fromId} —[${l.relationship}]→ ${l.toType} ${l.toId} (degree ${l.degree})`)
    .join("\n");

  return `You are a fraud risk analyst AI. Write a concise, factual investigator risk memo for the following merchant investigation.

MERCHANT: ${merchantId} — "${businessName}"
RISK SCORE: ${riskScore.total}/100 (${riskScore.level})

RISK FACTORS:
${riskScore.breakdown.map((f: RiskFactor) => `- ${f.factor} (+${f.points} pts): ${f.evidence}`).join("\n")}

GRAPH CONNECTIONS:
${linkSummary || "No suspicious graph connections found."}

ENRICHMENT DATA:
${enrichmentSummary}

Write a 3-5 sentence memo in plain English that:
1. States the risk level and top reason
2. Describes the most suspicious graph connections
3. Gives a clear recommended action (Approve / Send to Review / Block)
4. Uses specific IDs and numbers from the data above

Do NOT use bullet points. Write as a single professional paragraph.`;
}
