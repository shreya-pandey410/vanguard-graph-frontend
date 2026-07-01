import { RiskLevel } from '@prisma/client';
import { RiskMemoOutput, RingSummaryOutput, NextActionOutput } from '../../services/ai/ai.schemas';

export interface PayoutChangeInput {
  merchantId: string;
  previousBankAccountHash: string;
  newBankAccountHash: string;
  requestedByIp?: string;
  requestedByDeviceId?: string;
  webhookUrl?: string;
}

export interface PayoutChangeRiskScore {
  score: number;
  level: RiskLevel;
  signals: string[];
}

export interface PayoutChangeResult {
  runId: string;
  merchantId: string;
  investigationId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: string;
  riskMemo: RiskMemoOutput;
  ringSummary: RingSummaryOutput | null;
  nextAction: NextActionOutput;
  completedAt: string;
}
