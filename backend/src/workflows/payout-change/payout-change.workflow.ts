import { MerchantEvent } from "../shared/workflow-events";
import { runMerchantOnboardingWorkflow } from "../merchant-onboarding/merchant-onboarding.workflow";

// Payout change is the same investigation pipeline — the eventType field
// differentiates it, which the scoring engine accounts for (+10 pts for rapid change).
// In V2 you can add payout-specific graph checks here.

export async function runPayoutChangeWorkflow(event: MerchantEvent) {
  return runMerchantOnboardingWorkflow({ ...event, eventType: "PAYOUT_CHANGE" });
}
