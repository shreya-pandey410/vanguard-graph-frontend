import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("DeviceFingerprintService");

export interface DeviceRisk {
  fingerprint: string;
  seenCount: number;
  linkedMerchantIds: string[];
  riskFlags: string[];
}

// In MVP, this is mocked. In prod, call a real fingerprint intel API.
export async function analyzeDeviceFingerprint(fingerprint: string): Promise<DeviceRisk> {
  logger.info("Analyzing device fingerprint", { fingerprint });

  // Simulate async lookup
  await new Promise((r) => setTimeout(r, 100));

  // Mock: known risky fingerprints for demo
  const KNOWN_RISKY: Record<string, string[]> = {
    "FP-DEMO-001": ["M-001", "M-002", "M-003"],
    "FP-DEMO-002": ["M-004", "M-005"],
  };

  const linked = KNOWN_RISKY[fingerprint] || [];
  const riskFlags: string[] = [];

  if (linked.length >= 3) riskFlags.push("DEVICE_SHARED_MULTIPLE_MERCHANTS");
  if (linked.length >= 2) riskFlags.push("DEVICE_REUSE_DETECTED");

  return {
    fingerprint,
    seenCount: linked.length,
    linkedMerchantIds: linked,
    riskFlags,
  };
}
