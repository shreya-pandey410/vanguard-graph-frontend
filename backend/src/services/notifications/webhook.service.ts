import axios from "axios";
import { WorkflowLogger } from "../../workflows/shared/workflow-logger";
import { InvestigationResult } from "../../workflows/shared/workflow-events";

const logger = new WorkflowLogger("WebhookService");

export async function emitWebhook(result: InvestigationResult): Promise<void> {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  try {
    await axios.post(url, result, {
      headers: {
        "X-Webhook-Secret": process.env.WEBHOOK_SECRET || "",
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
    logger.info("Webhook emitted", { investigationId: result.investigationId });
  } catch (err: any) {
    logger.error("Webhook emission failed", { error: err.message });
  }
}
