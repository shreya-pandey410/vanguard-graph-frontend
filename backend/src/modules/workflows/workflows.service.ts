import { runMerchantOnboardingWorkflow, runPayoutChangeWorkflow } from "../../workflows";
import { triggerRenderWorkflow } from "../../services/render/workflow-trigger";
import { getInvestigation, listInvestigations, updateInvestigationAction } from "./workflows.repository";
import { MerchantEventInput } from "./workflows.types";
import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("WorkflowsService");

export async function triggerInvestigation(input: MerchantEventInput) {
  const event = { ...input, timestamp: input.timestamp || new Date().toISOString() };

  // Trigger Render Workflow (non-blocking, fire-and-forget for external tracking)
  // The actual investigation runs in-process as well for MVP reliability
  triggerRenderWorkflow({ investigationId: "pending", event }).catch(() => {});

  logger.info("Starting investigation workflow", { merchantId: event.merchantId, type: event.eventType });

  // Run in-process (async, non-blocking to HTTP response)
  const workflowFn = event.eventType === "PAYOUT_CHANGE" ? runPayoutChangeWorkflow : runMerchantOnboardingWorkflow;

  // Return investigationId immediately, run in background
  const promise = workflowFn(event);
  const investigationId = await new Promise<string>((resolve) => {
    // Poll until the investigation is registered in the store
    const poll = setInterval(() => {
      const all = listInvestigations();
      const match = all.find((inv) => inv.merchantId === event.merchantId);
      if (match) {
        clearInterval(poll);
        resolve(match.investigationId);
      }
    }, 50);
    // Fallback timeout
    setTimeout(() => {
      clearInterval(poll);
      resolve("pending-" + Date.now());
    }, 3000);
  });

  // Let workflow continue in background
  promise.catch((err) => logger.error("Background workflow error", { error: err.message }));

  return { investigationId, status: "TRIGGERED" };
}

export function fetchInvestigation(id: string) {
  return getInvestigation(id);
}

export function fetchAllInvestigations() {
  return listInvestigations();
}

export function applyInvestigatorAction(id: string, action: string) {
  return updateInvestigationAction(id, action);
}
