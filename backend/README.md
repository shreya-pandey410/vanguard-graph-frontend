# Vanguard Graph — Backend

> **Naitik's domain:** Render Workflows + AI Layer + Signal Enrichment

Fraud coordination intelligence engine for digital platforms. Converts onboarding and transaction signals into a live relationship graph, then runs a durable investigation workflow that scores risk, explains suspicious connections, and flags fraud rings before money moves.

---

## Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Graph DB:** Neo4j AuraDB (Cypher)
- **AI:** Anthropic Claude (claude-3-5-haiku) or mock mode
- **Workflows:** Render Workflows (external trigger) + in-process fallback
- **Enrichment:** Mock device, IP, email, KYC services (swap for real APIs)

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in NEO4J_URI, NEO4J_PASSWORD, ANTHROPIC_API_KEY
# Set AI_PROVIDER=mock for local dev without Anthropic key

# 3. Seed demo data into Neo4j
npx ts-node src/scripts/backfill-graph.ts

# 4. Run dev server
npm run dev
```

---

## API Endpoints

### Trigger Investigation
```
POST /api/workflows/trigger
Content-Type: application/json

{
  "merchantId": "M-NEW-001",
  "businessName": "Suspicious Merchant LLC",
  "email": "fraud123@mailinator.com",
  "phone": "+1-555-9999",
  "deviceFingerprint": "FP-DEMO-001",
  "ipAddress": "45.12.34.99",
  "bankAccountNumber": "ACCT-442",
  "bankRoutingNumber": "021000021",
  "eventType": "ONBOARDING"
}

→ 202 { "investigationId": "uuid", "status": "TRIGGERED" }
```

### Get Investigation
```
GET /api/workflows/:id
→ Full InvestigationResult with score, graphLinks, aiMemo, timeline
```

### List All Investigations
```
GET /api/workflows
→ Array of InvestigationResult (newest first)
```

### Take Action
```
POST /api/workflows/:id/action
{ "action": "BLOCK" | "REVIEW" | "APPROVE" }
```

---

## Demo Scenario

Run the backfill script first, then trigger an investigation for a new merchant that shares the demo device fingerprint `FP-DEMO-001` and bank account `ACCT-442`. The system will:

1. Enrich signals (device, IP, email, KYC)
2. Upsert graph nodes in Neo4j
3. Traverse graph → finds shared device with 3 merchants + shared bank with 2 flagged merchants
4. Score: 35 (shared bank) + 25 (device × 3) + 15 (fraud case proximity) = **75 → HIGH**
5. Generate AI memo explaining the fraud ring pattern
6. Recommend: **BLOCK**

---

## Risk Scoring Logic

| Factor | Points |
|--------|--------|
| Shared bank account with another merchant | +35 |
| Shared device with 2+ merchants | +25 |
| Shared device with 1 merchant | +15 |
| Fraud case proximity (2nd degree) | +15 |
| Risky IP (linked fraud cases) | +15 |
| Watchlist hit (KYC) | +20 |
| Disposable email | +10 |
| Rapid payout change (<24h) | +10 |

Score thresholds: `0-29 LOW` · `30-59 MEDIUM` · `60-100 HIGH`

---

## File Structure

```
src/
├── config/          # Neo4j + Anthropic client setup
├── routes/          # Express route definitions
├── modules/workflows/  # Controller → Service → Repository layer
├── services/
│   ├── render/      # Render Workflow trigger + status
│   ├── ai/          # Anthropic provider, mock provider, prompts, guardrails
│   ├── enrichment/  # Device, IP, email, KYC signal enrichment
│   └── notifications/ # Slack + webhook
├── workflows/
│   ├── merchant-onboarding/  # Main investigation workflow + activities
│   ├── payout-change/        # Payout-specific workflow (extends onboarding)
│   └── shared/               # Logger, retry policy, activity context, types
└── scripts/
    └── backfill-graph.ts     # Seed demo data into Neo4j
```
