# Workflow Design

Built on **Render Workflows** — durable, long-running investigation pipelines that survive process restarts and retry safely.

---

## Why Render Workflows?

Merchant onboarding triggers an async investigation pipeline that runs 9 steps: enrichment, Neo4j graph updates, Cypher risk queries, AI memo generation. These steps take **15–60 seconds** — too long for a synchronous HTTP response. Render Workflows provide:

- **Durable execution** — steps are checkpointed. If the process crashes on step 6, it resumes from step 6, not step 1.
- **Retry safety** — each step defines its own retry policy. Transient failures (Neo4j timeout, Claude API rate limit) auto-retry.
- **Status polling** — frontend polls workflow status every 2 seconds and updates the investigation UI in real time.

---

## Merchant Onboarding Workflow

**Trigger:** `POST /api/v1/merchants` — called from `merchants.service.ts`.

![Workflow Steps]

### Step 1: Validate Event
- Confirm merchant record exists in PostgreSQL
- Validate all required fields present (fallback — controller layer validates first)
- **Idempotent:** Yes. Read-only check.

### Step 2: Normalize Fields
- Strip whitespace from name
- Lowercase email
- Normalize phone to digits-only
- Remove non-alphanumeric characters from bank account number
- Validate IFSC format

### Step 3: Enrich Signals
Call enrichment services in parallel:
- **Device fingerprint lookup** (`enrichment/device-fingerprint.service.ts`) — mock: returns device type, OS, first seen date
- **IP risk score** (`enrichment/ip-risk.service.ts`) — mock: returns risk score 0–100, country, ISP
- **Email pattern check** (`enrichment/email-pattern.service.ts`) — mock: detects temp/disposable domains, checks name match
- **KYC verification** (`enrichment/mock-kyc.service.ts`) — mock: returns identity confidence score
- **Idempotent:** Yes. External reads.

### Step 4: Upsert Neo4j Graph
Create or update the following nodes and relationships in Neo4j AuraDB:

```
(:Merchant {id, name, email, status, riskScore})
  -[:USES_DEVICE]->(:Device {fingerprint, deviceType})
  -[:USES_IP]->(:IPAddress {address, riskScore, country})
  -[:USES_EMAIL]->(:Email {address, domain})
  -[:USES_PHONE]->(:Phone {number, carrier})
  -[:PAYS_OUT_TO]->(:BankAccount {accountNumber, ifsc, bankName})
```

- **Responsibility:** Anurag's Neo4j service
- **Idempotent:** Yes. MERGE (not CREATE) ensures nodes are upserted.

### Step 5: Run Cypher Risk Checks
Execute fraud detection queries against the graph:

| Query | Purpose |
|-------|---------|
| `shared-device.query.ts` | Find other merchants using same device fingerprint |
| `shared-bank-account.query.ts` | Find other merchants using same bank account |
| `graph-proximity.query.ts` | Find any path (≤2 hops) linking merchant to a confirmed FraudCase |
| `suspicious-paths.query.ts` | Find all paths involving shared entities across the merchant pool |

Each query returns `{ merchantId, signal, severity, linkedEntities }`.

- **Idempotent:** Yes. Read-only queries.

### Step 6: Compute Risk Score

Weighted heuristic applied to Cypher results:

| Signal | Weight | Max |
|--------|--------|-----|
| Shared bank account with flagged merchant (FraudCase) | +35 | 35 |
| Shared device with 2+ merchants | +25 | 25 |
| Shared IP with flagged case | +15 | 15 |
| Payout change within 24 hours of onboarding | +10 | 10 |
| Multiple profile edits in 1 hour | +10 | 10 |
| Contact pattern anomaly (email + phone mismatch) | +5 | 5 |
| **Total possible** | | **100** |

**Score → Risk Level mapping:**
- 0–29 → `low`
- 30–59 → `medium`
- 60–100 → `high`

Updates `Merchant.riskScore` and `Merchant.riskLevel` in PostgreSQL.

### Step 7: Generate AI Memo
Call Claude claude-sonnet-4-6 (Anthropic) with the risk signals to generate a plain-language investigator memo.

**Prompt input:**
```json
{
  "merchantName": "Rajesh Kumar Traders",
  "riskScore": 87,
  "signals": [
    {"type": "shared_device", "severity": "high", "detail": "Shares device D-773 with 4 merchants"},
    {"type": "shared_bank_account", "severity": "high", "detail": "Bank account #4421 linked to 3 merchants, one flagged as FraudCase FC-009"}
  ]
}
```

**Output (stored in `Investigation.riskMemo`):**
> **Merchant M-218 (Rajesh Kumar Traders)** shares device fingerprint **D-773** with 4 previously onboarded merchants. Two of those merchants route payouts to **Bank Account ending 4421**, already linked to one confirmed fraud case (**FC-009**). Risk score: **87/100 HIGH**. Recommended: Block and escalate.

- **Responsibility:** Naitik's AI service
- **Idempotent:** No — must use idempotency key to avoid duplicate AI calls on retry

### Step 8: Save Investigation Result
- Create/update `Investigation` record in PostgreSQL with riskScore, riskLevel, and riskMemo
- Create `Alert` if riskLevel is `medium` or `high`
- Update `WorkflowRun.status` to `completed`
- **Idempotent:** Yes. Upsert by investigation ID.

### Step 9: Notify Dashboard
- Update `WorkflowRun` status to `completed`
- Trigger frontend polling response (WebSocket or long-poll fallback)
- For HIGH risk: optional Slack notification (`services/notifications/slack.service.ts`)
- **Idempotent:** Yes. Status update is safe to repeat.

---

## Payout Change Workflow

**Trigger:** `POST /api/v1/merchants/:id/payout-change`

Same structure as onboarding, with one extra signal:

### Extra Signal: Rapid Payout Change
If the merchant is within 24 hours of their original onboarding date, the payout change is automatically treated as a **high-risk signal** (+10 to risk score). This catches the pattern: "onboard clean → immediately change bank account to fraud account."

### Steps
1. **Validate** — merchant exists, new bank account fields valid
2. **Upsert Neo4j** — create new `BankAccount` node, link via `PAYS_OUT_TO`
3. **Re-score** — re-run all 4 Cypher queries (now including the new account)
4. **Check rapid change** — add +10 if onboarding within 24h
5. **Generate AI Memo** — Claude evaluates incremental risk
6. **Save** — update merchant bank details, create new alert if score increased by ≥20 points
7. **Notify** — alert fraud team for HIGH risk changes

---

## Retry Policy

Every step defines its own retry behavior:

| Step | Retries | Backoff | Idempotent |
|------|---------|---------|------------|
| 1. Validate | 0 | — | Yes |
| 2. Normalize | 0 | — | Yes |
| 3. Enrich | 2 | 1s, 2s | Yes |
| 4. Upsert Neo4j | 3 | 1s, 2s, 4s | Yes (MERGE) |
| 5. Cypher Queries | 2 | 1s, 2s | Yes |
| 6. Compute Score | 0 | — | Yes |
| 7. AI Memo | 2 | 2s, 4s | **No** (uses idempotency key) |
| 8. Save Result | 2 | 1s, 2s | Yes |
| 9. Notify | 3 | 1s, 2s, 4s | Yes |

**On final failure:** `WorkflowRun.status` = `failed`, a HIGH severity alert is auto-created, and the merchant is moved to `under_review` status.

---

## Frontend Polling

The frontend polls workflow progress using `use-poll-run-status.ts`:

```
GET /api/v1/workflows/:runId/status
```

**Polling behavior:**
- Interval: every **2 seconds** while status is `pending` or `running`
- Stop polling on terminal states: `completed`, `failed`, `cancelled`
- UI shows step-by-step progress bar using the `step` field

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wf_abc123",
    "status": "running",
    "step": 5,
    "stepName": "Running Cypher Risk Checks",
    "progress": 5
  }
}
```

**Status → UI mapping:**

| Status | Step | UI Display |
|--------|------|------------|
| queued | 0 | Queued for processing |
| running | 1–4 | Validating & enriching signals |
| running | 5–6 | Analyzing graph for fraud links |
| running | 7 | Generating AI risk memo |
| running | 8–9 | Saving results |
| completed | 10 | Investigation complete |
| failed | — | Investigation failed — retrying... |
