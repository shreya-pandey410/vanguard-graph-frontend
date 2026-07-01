export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type InvestigationStatus =
  | "PENDING"
  | "INGESTING"
  | "ENRICHING"
  | "GRAPH_LINKING"
  | "SCORING"
  | "GENERATING_MEMO"
  | "COMPLETED"
  | "FAILED";
export type InvestigatorAction = "APPROVE" | "REVIEW" | "BLOCK";

export interface MerchantEvent {
  merchantId: string;
  businessName: string;
  email: string;
  phone: string;
  deviceFingerprint: string;
  ipAddress: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  eventType: "ONBOARDING" | "PAYOUT_CHANGE";
  timestamp: string;
}

export interface RiskScore {
  total: number;
  level: RiskLevel;
  breakdown: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  points: number;
  evidence: string;
}

export interface GraphLink {
  fromId: string;
  fromType: string;
  toId: string;
  toType: string;
  relationship: string;
  degree: number;
}

export interface EnrichmentData {
  deviceRisk: {
    fingerprint: string;
    seenCount: number;
    linkedMerchantIds: string[];
    riskFlags: string[];
  };
  ipRisk: {
    ip: string;
    isProxy: boolean;
    isVPN: boolean;
    isTor: boolean;
    country: string;
    riskScore: number;
    linkedFraudCases: number;
  };
  emailAnalysis: {
    email: string;
    domain: string;
    isDisposable: boolean;
    isFreemail: boolean;
    patternFlags: string[];
  };
  kycResult: {
    merchantId: string;
    kycStatus: "PASSED" | "FAILED" | "PENDING";
    idVerified: boolean;
    watchlistHit: boolean;
    pep: boolean;
    adverseMedia: boolean;
  };
}

export interface InvestigationResult {
  investigationId: string;
  merchantId: string;
  status: InvestigationStatus;
  riskScore: RiskScore | null;
  graphLinks: GraphLink[];
  aiMemo: string | null;
  recommendedAction: InvestigatorAction | null;
  timeline: TimelineEvent[];
  enrichment?: EnrichmentData;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  ts: string;
  event: string;
  detail?: string;
}

export interface WorkflowTriggerResult {
  workflowRunId: string;
  investigationId: string;
  status: "TRIGGERED" | "QUEUED";
}
