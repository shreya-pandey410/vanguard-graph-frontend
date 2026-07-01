import { RISK_WEIGHTS, RiskSignal, RISK_THRESHOLDS } from './weights';

// Input: kaunse signals trigger hue (true/false).
// Aage chahe to ise boolean se number (0-1 confidence) bana sakta hai.
export type SignalFlags = Partial<Record<RiskSignal, boolean>>;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskScoreResult {
  score: number;              // 0-100
  level: RiskLevel;
  triggeredSignals: RiskSignal[];
}

export function calculateRiskScore(flags: SignalFlags): RiskScoreResult {
  let score = 0;
  const triggeredSignals: RiskSignal[] = [];

  // Har triggered signal ka weight add kar
  for (const signal of Object.keys(RISK_WEIGHTS) as RiskSignal[]) {
    if (flags[signal]) {
      score += RISK_WEIGHTS[signal];
      triggeredSignals.push(signal);
    }
  }

  // Safety clamp — weights ka sum 100 se zyada na ho jaye galti se
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    level: toRiskLevel(score),
    triggeredSignals,
  };
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.high) return 'HIGH';
  if (score >= RISK_THRESHOLDS.medium) return 'MEDIUM';
  return 'LOW';
}