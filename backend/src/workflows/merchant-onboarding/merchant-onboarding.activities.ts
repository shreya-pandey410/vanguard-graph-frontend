import { ActivityContext, addTimelineEvent } from "../shared/activity-context";
import { GraphLink, RiskFactor, RiskScore, EnrichmentData } from "../shared/workflow-events";
import { analyzeDeviceFingerprint } from "../../services/enrichment/device-fingerprint.service";
import { analyzeIPRisk } from "../../services/enrichment/ip-risk.service";
import { analyzeEmailPattern } from "../../services/enrichment/email-pattern.service";
import { runMockKYC } from "../../services/enrichment/mock-kyc.service";
import { getSession } from "../../config/neo4j";
import { WorkflowLogger } from "../shared/workflow-logger";
import { withRetry } from "../shared/retry-policy";

const logger = new WorkflowLogger("MerchantOnboardingActivities");

// ─── Activity 1: Validate Event ──────────────────────────────────────────────
export async function actValidateEvent(ctx: ActivityContext): Promise<void> {
  addTimelineEvent(ctx, "VALIDATING", "Checking event schema and required fields");
  const e = ctx.merchantEvent;
  if (!e.merchantId || !e.email || !e.deviceFingerprint || !e.bankAccountNumber) {
    throw new Error("Invalid merchant event: missing required fields");
  }
  addTimelineEvent(ctx, "VALIDATED", "Event is valid");
}

// ─── Activity 2: Enrich Signals ──────────────────────────────────────────────
export async function actEnrichSignals(ctx: ActivityContext): Promise<void> {
  addTimelineEvent(ctx, "ENRICHING", "Running device, IP, email, and KYC enrichment");
  const e = ctx.merchantEvent;

  const [deviceRisk, ipRisk, emailAnalysis, kycResult] = await Promise.all([
    withRetry(() => analyzeDeviceFingerprint(e.deviceFingerprint), undefined, "device-enrichment"),
    withRetry(() => analyzeIPRisk(e.ipAddress), undefined, "ip-enrichment"),
    withRetry(() => analyzeEmailPattern(e.email), undefined, "email-enrichment"),
    withRetry(() => runMockKYC(e.merchantId, e.businessName), undefined, "kyc"),
  ]);

  const enrichment: EnrichmentData = { deviceRisk, ipRisk, emailAnalysis, kycResult };
  ctx.result.enrichment = enrichment;

  addTimelineEvent(
    ctx,
    "ENRICHED",
    `Device seen: ${deviceRisk.seenCount}x | IP risk: ${ipRisk.riskScore} | KYC: ${kycResult.kycStatus}`
  );
}

// ─── Activity 3: Upsert Graph ─────────────────────────────────────────────────
export async function actUpsertGraph(ctx: ActivityContext): Promise<void> {
  addTimelineEvent(ctx, "GRAPH_LINKING", "Upserting nodes and relationships into Neo4j");
  const e = ctx.merchantEvent;

  const session = await getSession();
  try {
    await session.run(
      `MERGE (m:Merchant {id: $merchantId})
       SET m.businessName = $businessName, m.email = $email, m.phone = $phone, m.updatedAt = datetime()

       MERGE (d:Device {fingerprint: $device})
       MERGE (ip:IPAddress {ip: $ip})
       MERGE (em:Email {email: $email})
       MERGE (ph:Phone {phone: $phone})
       MERGE (ba:BankAccount {account: $bankAccount})

       MERGE (m)-[:USES_DEVICE]->(d)
       MERGE (m)-[:USES_IP]->(ip)
       MERGE (m)-[:USES_EMAIL]->(em)
       MERGE (m)-[:USES_PHONE]->(ph)
       MERGE (m)-[:PAYS_OUT_TO]->(ba)`,
      {
        merchantId: e.merchantId,
        businessName: e.businessName,
        email: e.email,
        phone: e.phone,
        device: e.deviceFingerprint,
        ip: e.ipAddress,
        bankAccount: e.bankAccountNumber,
      }
    );
    logger.info("Graph upserted", { merchantId: e.merchantId });
  } finally {
    await session.close();
  }

  addTimelineEvent(ctx, "GRAPH_LINKED", "5 entity nodes upserted with relationships");
}

// ─── Activity 4: Traverse Graph for Risk Links ────────────────────────────────
export async function actTraverseGraph(ctx: ActivityContext): Promise<GraphLink[]> {
  addTimelineEvent(ctx, "TRAVERSING", "Running Cypher fraud link detection");
  const e = ctx.merchantEvent;
  const links: GraphLink[] = [];

  const session = await getSession();
  try {
    // Shared device with other merchants
    const deviceResult = await session.run(
      `MATCH (m:Merchant {id: $merchantId})-[:USES_DEVICE]->(d:Device)<-[:USES_DEVICE]-(other:Merchant)
       WHERE other.id <> $merchantId
       RETURN other.id AS otherId, d.fingerprint AS device`,
      { merchantId: e.merchantId }
    );
    for (const rec of deviceResult.records) {
      links.push({
        fromId: e.merchantId,
        fromType: "Merchant",
        toId: rec.get("otherId") as string,
        toType: "Merchant",
        relationship: "SHARED_DEVICE",
        degree: 2,
      });
    }

    // Shared bank account with other merchants
    const bankResult = await session.run(
      `MATCH (m:Merchant {id: $merchantId})-[:PAYS_OUT_TO]->(ba:BankAccount)<-[:PAYS_OUT_TO]-(other:Merchant)
       WHERE other.id <> $merchantId
       RETURN other.id AS otherId, ba.account AS account`,
      { merchantId: e.merchantId }
    );
    for (const rec of bankResult.records) {
      links.push({
        fromId: e.merchantId,
        fromType: "Merchant",
        toId: rec.get("otherId") as string,
        toType: "Merchant",
        relationship: "SHARED_BANK_ACCOUNT",
        degree: 2,
      });
    }

    // Proximity to FraudCase via shared device (3rd degree)
    const fraudResult = await session.run(
      `MATCH (m:Merchant {id: $merchantId})-[:USES_DEVICE]->(d:Device)<-[:USES_DEVICE]-(other:Merchant)-[:FLAGGED_IN]->(fc:FraudCase)
       RETURN fc.id AS caseId`,
      { merchantId: e.merchantId }
    );
    for (const rec of fraudResult.records) {
      links.push({
        fromId: e.merchantId,
        fromType: "Merchant",
        toId: rec.get("caseId") as string,
        toType: "FraudCase",
        relationship: "CONNECTED_TO_FRAUD_CASE",
        degree: 3,
      });
    }
  } finally {
    await session.close();
  }

  ctx.result.graphLinks = links;
  addTimelineEvent(ctx, "TRAVERSED", `Found ${links.length} suspicious graph connections`);
  return links;
}

// ─── Activity 5: Compute Risk Score ──────────────────────────────────────────
export async function actComputeScore(ctx: ActivityContext, links: GraphLink[]): Promise<RiskScore> {
  addTimelineEvent(ctx, "SCORING", "Computing weighted risk score");
  const breakdown: RiskFactor[] = [];
  let total = 0;

  const sharedBank = links.filter((l) => l.relationship === "SHARED_BANK_ACCOUNT");
  const sharedDevice = links.filter((l) => l.relationship === "SHARED_DEVICE");
  const fraudCaseLinks = links.filter((l) => l.relationship === "CONNECTED_TO_FRAUD_CASE");

  if (sharedBank.length > 0) {
    breakdown.push({ factor: "SHARED_BANK_ACCOUNT", points: 35, evidence: `Linked to ${sharedBank.length} other merchant(s) via same bank account` });
    total += 35;
  }
  if (sharedDevice.length >= 2) {
    breakdown.push({ factor: "SHARED_DEVICE_MULTIPLE", points: 25, evidence: `Device fingerprint shared with ${sharedDevice.length} other merchants` });
    total += 25;
  } else if (sharedDevice.length === 1) {
    breakdown.push({ factor: "SHARED_DEVICE", points: 15, evidence: "Device fingerprint shared with 1 other merchant" });
    total += 15;
  }
  if (fraudCaseLinks.length > 0) {
    breakdown.push({ factor: "FRAUD_CASE_PROXIMITY", points: 15, evidence: `Connected to ${fraudCaseLinks.length} active fraud case(s) via 2nd-degree device link` });
    total += 15;
  }

  const enrichment = ctx.result.enrichment;
  if (enrichment) {
    if (enrichment.ipRisk.linkedFraudCases > 0) {
      breakdown.push({ factor: "RISKY_IP", points: 15, evidence: `IP linked to ${enrichment.ipRisk.linkedFraudCases} fraud case(s)` });
      total += 15;
    }
    if (enrichment.emailAnalysis.isDisposable) {
      breakdown.push({ factor: "DISPOSABLE_EMAIL", points: 10, evidence: "Disposable email domain detected" });
      total += 10;
    }
    if (enrichment.kycResult.watchlistHit) {
      breakdown.push({ factor: "WATCHLIST_HIT", points: 20, evidence: "Business name matched watchlist entry" });
      total += 20;
    }
    if (ctx.merchantEvent.eventType === "PAYOUT_CHANGE") {
      const eventTime = new Date(ctx.merchantEvent.timestamp).getTime();
      if (Date.now() - eventTime < 86400000) {
        breakdown.push({ factor: "RAPID_PAYOUT_CHANGE", points: 10, evidence: "Payout change within 24h of account creation" });
        total += 10;
      }
    }
  }

  total = Math.min(total, 100);
  const level: RiskLevel = total >= 60 ? "HIGH" : total >= 30 ? "MEDIUM" : "LOW";
  const score: RiskScore = { total, level, breakdown };
  ctx.result.riskScore = score;

  addTimelineEvent(ctx, "SCORED", `Risk score: ${total}/100 (${level})`);
  return score;
}

// Import RiskLevel locally (already exported from workflow-events but needed here)
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
