import { investigationStore } from "../../workflows/merchant-onboarding/merchant-onboarding.workflow";
import { InvestigationResult } from "../../workflows/shared/workflow-events";

export function getInvestigation(id: string): InvestigationResult | null {
  return investigationStore.get(id) || null;
}

export function listInvestigations(): InvestigationResult[] {
  return Array.from(investigationStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateInvestigationAction(id: string, action: string): boolean {
  const inv = investigationStore.get(id);
  if (!inv) return false;
  investigationStore.set(id, { ...inv, recommendedAction: action as any, updatedAt: new Date().toISOString() });
  return true;
}
