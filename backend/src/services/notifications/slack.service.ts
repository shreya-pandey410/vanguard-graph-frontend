import axios from "axios";
import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("SlackService");

export async function sendSlackAlert(message: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.warn("SLACK_WEBHOOK_URL not set, skipping notification");
    return;
  }
  try {
    await axios.post(webhookUrl, { text: message });
    logger.info("Slack alert sent");
  } catch (err: any) {
    logger.error("Slack notification failed", { error: err.message });
  }
}

export async function notifyHighRiskMerchant(merchantId: string, score: number, memo: string) {
  const msg = `🚨 *HIGH RISK MERCHANT DETECTED*\nMerchant: \`${merchantId}\`\nScore: ${score}/100\n\n${memo.slice(0, 300)}...`;
  await sendSlackAlert(msg);
}
