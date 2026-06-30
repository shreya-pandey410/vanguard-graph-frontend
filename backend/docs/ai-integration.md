# AI Integration

Claude claude-sonnet-4-6 via Anthropic API converts raw graph findings into plain-language investigator memos. Makes fraud intelligence readable by non-technical fraud analysts.

---

## Why Claude?

Fraud detection produces structured signals: *"shared_device: true, weight: +25, merchant_count: 5"*. A fraud analyst needs to read that as: *"This merchant shares a device with 4 other accounts. That's suspicious."*

Claude bridges the gap. It takes structured fraud signals and writes them as an investigator would — with context, severity assessment, and recommended action.

---

## Three Prompts

### Prompt 1: `risk-memo.prompt.ts`
> Generate a full investigator risk memo for a single merchant.

**Called in:** Merchant Onboarding Workflow Step 7, Payout Change Workflow Step 5.

**Input:**
```json
{
  "merchantId": "m-218",
  "merchantName": "Rajesh Kumar Traders",
  "riskScore": 87,
  "signals": [
    {
      "type": "shared_device",
      "severity": "high",
      "detail": "Shares device D-773 with 4 other merchants: Suresh Patel, Amit Singh, Vikram Joshi, Deepak Verma"
    },
    {
      "type": "shared_bank_account",
      "severity": "high",
      "detail": "Pays out to bank account ending in 4421, shared by 3 merchants including Priya Sharma (linked to FraudCase FC-009)"
    },
    {
      "type": "rapid_payout_change",
      "severity": "medium",
      "detail": "Changed bank account within 24 hours of onboarding"
    }
  ],
  "linkedFraudCases": ["FC-009"],
  "recommendedAction": "Block"
}
```

**Output:**
> Merchant **M-218 (Rajesh Kumar Traders)** shares device fingerprint **D-773** with 4 previously onboarded merchants. Two of those merchants route payouts to **Bank Account ending 4421**, which is already linked to one confirmed fraud case (**FC-009**). Additionally, a payout change was requested within 24 hours of onboarding — a known fraud pattern. Risk score: **87/100 HIGH**. Recommended action: Block and escalate to compliance team.

---

### Prompt 2: `ring-summary.prompt.ts`
> Summarize the full fraud ring for the Ring Replay UI. Called when an investigator opens a ring investigation.

**Input:**
```json
{
  "ringId": "RG-003",
  "memberCount": 5,
  "sharedEntities": [
    {"type": "device", "value": "D-773", "memberCount": 5},
    {"type": "bank_account", "value": "4421", "memberCount": 3}
  ],
  "timelineEvents": [
    {"date": "2026-06-28T10:00:00Z", "event": "Merchant Rajesh Kumar onboarded (device D-773)"},
    {"date": "2026-06-28T10:15:00Z", "event": "Merchant Suresh Patel onboarded (same device D-773)"},
    {"date": "2026-06-28T14:00:00Z", "event": "Merchant Priya Sharma onboarded (new device, but bank account #4421)"},
    {"date": "2026-06-29T09:00:00Z", "event": "Merchant Rajesh Kumar changes payout to account #4421"}
  ]
}
```

**Output:**
> Fraud Ring **RG-003** consists of 5 merchants that assembled over 23 hours. The ring opened with **Rajesh Kumar** onboarding from device **D-773**. Three more merchants joined within 15 minutes using the same device — suggesting a single operator running multiple accounts. The next day, **Priya Sharma** entered using a different device but linking **bank account #4421** — the payout target. Later, Rajesh Kumar changed his payout to the same #4421 account, connecting the device cluster to the bank cluster. This is a classic "clean onboarding → swap payout" fraud pattern.

---

### Prompt 3: `next-action.prompt.ts`
> Recommend the next action for a fraud analyst reviewing an alert.

**Called in:** Investigation detail view, when analyst opens an alert.

**Input:**
```json
{
  "riskScore": 87,
  "riskLevel": "high",
  "currentStatus": "under_review",
  "findings": [
    "Shares device D-773 with 4 merchants",
    "Shares bank account #4421 with flagged merchant",
    "Rapid payout change detected"
  ],
  "evidenceCount": 3
}
```

**Output:**
> **Recommendation: Escalate to Compliance**
> This merchant has 3 high-severity signals including a shared bank account with a confirmed fraud case. The evidence is sufficient for escalation. No additional investigation needed.

**Possible outputs:** `"Approve"`, `"Send to Review"`, `"Block"`, `"Escalate to Compliance"` — each with a one-sentence rationale.

---

## Provider Architecture

```
┌──────────────────────────────────────────────────┐
│               AI Service                         │
│  ┌────────────────────────────────────────┐       │
│  │  selectProvider()                      │       │
│  │  if ANTHROPIC_API_KEY is empty → mock  │       │
│  │  else → anthropic                      │       │
│  └──────────┬─────────────────────────────┘       │
│             │                                      │
│     ┌───────┴───────┐                              │
│     ▼               ▼                               │
│  ┌──────────┐  ┌──────────┐                        │
│  │Anthropic │  │  Mock    │                        │
│  │ Provider │  │ Provider │                        │
│  └──────────┘  └──────────┘                        │
│       │              │                              │
│       ▼              ▼                              │
│  ┌─────────────────────────────┐                   │
│  │       Guardrails            │                   │
│  │  - max_tokens: 500          │                   │
│  │  - temperature: 0.1        │                   │
│  │  - content safety check    │                   │
│  └─────────────────────────────┘                   │
└──────────────────────────────────────────────────┘
```

### anthropic.provider.ts
Real Claude API calls via Anthropic SDK. Handles:
- Request construction with system prompt + user prompt
- Token counting
- Response parsing (AI returns JSON or plain text depending on prompt)
- Error handling (rate limits, timeouts → fallback to mock provider)

### mock.provider.ts
Returns hardcoded realistic memos for demo and development. No API credits consumed. The mock data references the actual seed data (merchants D-773, bank account #4421, FraudCase FC-009), so the demo is coherent end-to-end.

---

## Guardrails

| Guardrail | Risk Memo | Ring Summary | Next Action |
|-----------|-----------|-------------|-------------|
| max_tokens | 500 | 600 | 200 |
| temperature | 0.1 | 0.2 | 0.1 |
| Fallback on failure | Mock provider | Mock provider | Mock provider |
| Input sanitization | Removes PII except merchant name and risk signals | Same | Same |

**Temperature rationale:** 0.1 keeps Claude deterministic and consistent. Fraud analysis needs repeatability — the same signals should produce the same memo every time.

---

## Cost Estimate for Demo

| Operation | Input Tokens | Output Tokens | Total | Cost (Claude 4 Sonnet ~$3/M input, $15/M output) |
|-----------|-------------|---------------|-------|---------------------------------------------------|
| Risk memo | ~400 | ~150 | 550 | ~$0.003 |
| Ring summary | ~600 | ~200 | 800 | ~$0.005 |
| Next action | ~200 | ~50 | 250 | ~$0.001 |

**Per investigation:** ~$0.009 (less than 1 cent)
**Full demo (20 merchants, 1 ring, 5 actions):** ~$0.10 — essentially free.
