import { AI_PROVIDER } from "../../config/ai";
import { callAnthropic } from "./providers/anthropic.provider";
import { callMock } from "./providers/mock.provider";
import { buildRiskMemoPrompt } from "./prompts/risk-memo.prompt";
import { buildRingSummaryPrompt } from "./prompts/ring-summary.prompt";
import { buildNextActionPrompt } from "./prompts/next-action.prompt";
import { parseNextAction } from "./ai.schemas";
import { RiskScore, GraphLink } from "../../workflows/shared/workflow-events";
import type { InvestigatorAction } from "../../workflows/shared/workflow-events";
import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("AIService");

async function callAI(prompt: string): Promise<string> {
  if (AI_PROVIDER === "mock") {
    return callMock(prompt);
  }
  return callAnthropic(prompt);
}

export async function generateRiskMemo(params: {
  merchantId: string;
  businessName: string;
  riskScore: RiskScore;
  graphLinks: GraphLink[];
  enrichmentSummary: string;
}): Promise<string> {
  logger.info("Generating risk memo", { merchantId: params.merchantId });
  const prompt = buildRiskMemoPrompt(params);
  return callAI(prompt);
}

export async function generateRingSummary(links: GraphLink[]): Promise<string> {
  logger.info("Generating ring summary", { linkCount: links.length });
  const prompt = buildRingSummaryPrompt(links);
  return callAI(prompt);
}

export async function determineNextAction(riskScore: RiskScore): Promise<InvestigatorAction> {
  logger.info("Determining next action", { score: riskScore.total });
  const prompt = buildNextActionPrompt(riskScore);
  const raw = await callAI(prompt);
  return parseNextAction(raw);
}
