import { MerchantEvent, InvestigationResult } from "../../workflows/shared/workflow-events";

export interface MerchantOnboardingInput {
  investigationId: string;
  event: MerchantEvent;
}

export interface MerchantOnboardingOutput {
  result: InvestigationResult;
}
