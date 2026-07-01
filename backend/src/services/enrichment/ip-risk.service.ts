import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("IPRiskService");

export interface IPRisk {
  ip: string;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  country: string;
  riskScore: number; // 0-100
  linkedFraudCases: number;
}

export async function analyzeIPRisk(ip: string): Promise<IPRisk> {
  logger.info("Analyzing IP risk", { ip });
  await new Promise((r) => setTimeout(r, 80));

  // Mock risky IPs for demo
  const RISKY_IPS: Record<string, Partial<IPRisk>> = {
    "10.0.0.DEMO-BAD": { isProxy: true, riskScore: 80, linkedFraudCases: 2 },
    "192.168.DEMO-VPN": { isVPN: true, riskScore: 60, linkedFraudCases: 1 },
  };

  const override = RISKY_IPS[ip] || {};

  return {
    ip,
    isProxy: false,
    isVPN: false,
    isTor: false,
    country: "IN",
    riskScore: 10,
    linkedFraudCases: 0,
    ...override,
  };
}
