import { renderClient } from "./render-client";
import { MerchantEvent } from "../../workflows/shared/workflow-events";
import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("WorkflowTrigger");

export interface TriggerPayload {
  investigationId: string;
  event: MerchantEvent;
}

export async function triggerRenderWorkflow(payload: TriggerPayload): Promise<string> {
  const workflowId = process.env.RENDER_WORKFLOW_ID;

  if (!workflowId) {
    logger.warn("RENDER_WORKFLOW_ID not set, skipping external trigger");
    return "mock-run-" + Date.now();
  }

  try {
    const res = await renderClient.post(`/workflows/${workflowId}/runs`, {
      input: JSON.stringify(payload),
    });
    logger.info("Render workflow triggered", { runId: res.data?.id });
    return res.data?.id || "unknown";
  } catch (err: any) {
    logger.error("Failed to trigger Render workflow", { error: err.message });
    // Don't throw — investigation continues in-process as fallback
    return "fallback-run-" + Date.now();
  }
}
