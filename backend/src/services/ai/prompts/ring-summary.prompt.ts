import { GraphLink } from "../../../workflows/shared/workflow-events";

export function buildRingSummaryPrompt(links: GraphLink[]): string {
  const linkText = links
    .map((l) => `${l.fromId} —[${l.relationship}]→ ${l.toId}`)
    .join("\n");

  return `You are a fraud ring analyst. Given these entity connections from a graph database, identify if these merchants form a coordinated fraud ring. Be concise (2-3 sentences). Describe the coordination pattern.

CONNECTIONS:
${linkText}

Focus on: shared payout accounts, shared devices, IP clustering, or other coordination signals.`;
}
