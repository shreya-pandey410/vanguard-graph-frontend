import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("MockKYCService");

export interface KYCResult {
  merchantId: string;
  kycStatus: "PASSED" | "FAILED" | "PENDING";
  idVerified: boolean;
  watchlistHit: boolean;
  pep: boolean; // Politically Exposed Person
  adverseMedia: boolean;
}

export async function runMockKYC(merchantId: string, businessName: string): Promise<KYCResult> {
  logger.info("Running mock KYC", { merchantId, businessName });
  await new Promise((r) => setTimeout(r, 200));

  // Demo: force a watchlist hit for specific demo merchants
  const isWatchlistHit = businessName.toLowerCase().includes("demo-fraud");

  return {
    merchantId,
    kycStatus: isWatchlistHit ? "FAILED" : "PASSED",
    idVerified: !isWatchlistHit,
    watchlistHit: isWatchlistHit,
    pep: false,
    adverseMedia: isWatchlistHit,
  };
}
