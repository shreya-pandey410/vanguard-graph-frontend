import { v4 as uuidv4 } from "uuid";
import { createActivityContext, addTimelineEvent } from "../shared/activity-context";
import {
  actValidateEvent,
  actEnrichSignals,
  actUpsertGraph,
  actTraverseGraph,
  actComputeScore,
} from "./merchant-onboarding.activities";
import { generateRiskMemo, determineNextAction } from "../../services/ai/ai.service";
import { notifyHighRiskMerchant } from "../../services/notifications/slack.service";
import { emitWebhook } from "../../services/notifications/webhook.service";
import { MerchantEvent, InvestigationResult, InvestigationStatus } from "../shared/workflow-events";
import { WorkflowLogger } from "../shared/workflow-logger";
import { withRetry } from "../shared/retry-policy";

const logger = new WorkflowLogger("MerchantOnboardingWorkflow");

// In-memory store for MVP (replace with DB in prod)
export const investigationStore = new Map<string, InvestigationResult>();

function updateStore(id: string, patch: Partial<InvestigationResult>) {
  const existing = investigationStore.get(id) || ({} as InvestigationResult);
  investigationStore.set(id, { ...existing, ...patch, updatedAt: new Date().toISOString() });
}

export async function runMerchantOnboardingWorkflow(event: MerchantEvent): Promise<InvestigationResult> {
  const investigationId = uuidv4();
  const now = new Date().toISOString();

  const initial: InvestigationResult = {
    investigationId,
    merchantId: event.merchantId,
    status: "PENDING",
    riskScore: null,
    graphLinks: [],
    aiMemo: null,
    recommendedAction: null,
    timeline: [],
    createdAt: now,
    updatedAt: now,
  };
  investigationStore.set(investigationId, initial);

  const ctx = createActivityContext(investigationId, event);

  const setStatus = (status: InvestigationStatus) => {
    ctx.result.status = status;
    updateStore(investigationId, { status, timeline: ctx.timeline });
    logger.info(`Status: ${status}`, { investigationId });
  };

  try {
    // Stage 1: Validate
    setStatus("INGESTING");
    await actValidateEvent(ctx);

    // Stage 2: Enrich
    setStatus("ENRICHING");
    await withRetry(() => actEnrichSignals(ctx), undefined, "enrich-signals");

    // Stage 3: Graph upsert
    setStatus("GRAPH_LINKING");
    await withRetry(() => actUpsertGraph(ctx), undefined, "upsert-graph");

    // Stage 4: Traverse
    const links = await withRetry(() => actTraverseGraph(ctx), undefined, "traverse-graph");

    // Stage 5: Score
    setStatus("SCORING");
    const riskScore = await actComputeScore(ctx, links);

    // Stage 6: AI Memo
    setStatus("GENERATING_MEMO");
    const enrichment = (ctx.result as any).enrichment;
    const enrichmentSummary = enrichment
      ? `Device seen ${enrichment.deviceRisk?.seenCount || 0} times. IP risk: ${enrichment.ipRisk?.riskScore || 0}. Email disposable: ${enrichment.emailAnalysis?.isDisposable || false}. KYC: ${enrichment.kycResult?.kycStatus || "N/A"}.`
      : "No enrichment data.";

    const [aiMemo, recommendedAction] = await Promise.all([
      withRetry(
        () => generateRiskMemo({ merchantId: event.merchantId, businessName: event.businessName, riskScore, graphLinks: links, enrichmentSummary }),
        undefined,
        "generate-memo"
      ),
      withRetry(() => determineNextAction(riskScore), undefined, "determine-action"),
    ]);

    addTimelineEvent(ctx, "MEMO_GENERATED", `Action: ${recommendedAction}`);

    const finalResult: InvestigationResult = {
      investigationId,
      merchantId: event.merchantId,
      status: "COMPLETED",
      riskScore,
      graphLinks: links,
      aiMemo,
      recommendedAction,
      timeline: ctx.timeline,
      createdAt: now,
      updatedAt: new Date().toISOString(),
    };

    investigationStore.set(investigationId, finalResult);

    // Notify if high risk
    if (riskScore.level === "HIGH") {
      await notifyHighRiskMerchant(event.merchantId, riskScore.total, aiMemo).catch(() => {});
    }

    // Emit webhook
    await emitWebhook(finalResult).catch(() => {});

    logger.info("Investigation completed", { investigationId, score: riskScore.total, action: recommendedAction });
    return finalResult;
  } catch (err: any) {
    logger.error("Investigation failed", { investigationId, error: err.message });
    addTimelineEvent(ctx, "FAILED", err.message);
    const failed = { ...initial, status: "FAILED" as InvestigationStatus, timeline: ctx.timeline, updatedAt: new Date().toISOString() };
    investigationStore.set(investigationId, failed);
    return failed;
  }
}
