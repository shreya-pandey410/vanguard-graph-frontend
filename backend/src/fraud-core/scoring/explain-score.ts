import { RISK_WEIGHTS, SIGNAL_LABELS, RiskSignal } from './weights';
import { RiskScoreResult } from './calculate-risk-score';

export interface ScoreExplanation {
  score: number;
  level: string;
  summary: string;
  factors: {
    signal: RiskSignal;
    label: string;
    contribution: number;     // is signal ne kitne points add kiye
    percentage: number;        // total score ka kitna % is signal se
  }[];
}

export function explainScore(result: RiskScoreResult): ScoreExplanation {
  const factors = result.triggeredSignals
    .map((signal) => {
      const contribution = RISK_WEIGHTS[signal];
      return {
        signal,
        label: SIGNAL_LABELS[signal],
        contribution,
        // 0 se divide na ho jaye
        percentage: result.score === 0
          ? 0
          : Number(((contribution / result.score) * 100).toFixed(1)),
      };
    })
    // sabse bada contributor sabse upar — analyst ko pehle wahi dikhna chahiye
    .sort((a, b) => b.contribution - a.contribution);

  return {
    score: result.score,
    level: result.level,
    summary: buildSummary(result, factors),
    factors,
  };
}

function buildSummary(
  result: RiskScoreResult,
  factors: ScoreExplanation['factors'],
): string {
  if (factors.length === 0) {
    return `Risk score ${result.score} (${result.level}). No risk signals triggered.`;
  }
  const top = factors[0].label;
  return `Risk score ${result.score} (${result.level}). ${factors.length} signal(s) triggered, primary driver: ${top}.`;
}