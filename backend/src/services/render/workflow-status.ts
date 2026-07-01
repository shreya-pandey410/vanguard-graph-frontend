import { renderClient } from "./render-client";
import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("WorkflowStatus");

export interface WorkflowRunStatus {
  id: string;
  status: string;
  createdAt: string;
  finishedAt?: string;
}

export async function getWorkflowRunStatus(runId: string): Promise<WorkflowRunStatus | null> {
  const workflowId = process.env.RENDER_WORKFLOW_ID;
  if (!workflowId || runId.startsWith("mock") || runId.startsWith("fallback")) {
    return { id: runId, status: "completed", createdAt: new Date().toISOString() };
  }

  try {
    const res = await renderClient.get(`/workflows/${workflowId}/runs/${runId}`);
    return res.data as WorkflowRunStatus;
  } catch (err: any) {
    logger.error("Failed to fetch workflow run status", { runId, error: err.message });
    return null;
  }
}
