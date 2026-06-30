export enum WorkflowAction {
  ALLOW = 'ALLOW',
  STEP_UP_AUTH = 'STEP_UP_AUTH',
  FLAG_FOR_REVIEW = 'FLAG_FOR_REVIEW',
  NOTIFY = 'NOTIFY',
  ESCALATE = 'ESCALATE',
  BLOCK = 'BLOCK',
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum StepStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface WorkflowStep {
  action: WorkflowAction;
  status: StepStatus;
  reason?: string;
  executedAt?: string;
  error?: string;
}

export interface Workflow {
  id: string;
  transactionId: string;
  riskScore: number;
  triggeredRules: string[];
  status: WorkflowStatus;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

// Input jo risk module se aata hai
export interface RiskDecisionInput {
  transactionId: string;
  riskScore: number;       // 0–100
  triggeredRules: string[]; // e.g. ['VELOCITY_5MIN', 'GEO_MISMATCH']
}