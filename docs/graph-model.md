# Graph Model (Neo4j AuraDB)

Schema for the fraud coordination knowledge graph that powers Vanguard Graph's ring detection.

---

## Why a Graph for Fraud Detection?

Flat SQL checks answer: *"Does this bank account exist in my database?"*

They cannot answer: *"Does the device that onboarded this merchant also appear in 4 other merchants, two of which route payouts to a bank account already linked to a confirmed fraud case?"*

That question requires **second-degree traversal** — and that's what Neo4j does. A graph database stores entities (nodes) and their connections (relationships) natively, so traversing `merchant → device → merchant → bank account → fraud case` is a single query, not a chain of JOINs.

---

## Node Types (7 nodes)

### Merchant
Primary entity being risk-assessed. Created when a new merchant is onboarded.

| Property | Type | Example |
|----------|------|---------|
| id | string | `m-218` |
| name | string | `"Rajesh Kumar Traders"` |
| email | string | `"rajesh@example.com"` |
| status | string | `"pending"`, `"approved"`, `"under_review"`, `"blocked"` |
| riskScore | int | 0–100 |
| riskLevel | string | `"low"`, `"medium"`, `"high"` |

### BankAccount
Payout destination. Shared bank accounts are the strongest fraud signal — multiple merchants routing to one account indicates coordinated operation.

| Property | Type | Example |
|----------|------|---------|
| accountNumber | string | `"123456789012"` |
| ifsc | string | `"HDFC0001234"` |
| bankName | string | `"HDFC Bank"` |

### Device
Physical device used during onboarding. Captured via browser fingerprint. Devices are rarely shared by legitimate businesses.

| Property | Type | Example |
|----------|------|---------|
| fingerprint | string | `"D-773"` |
| deviceType | string | `"mobile"`, `"desktop"` |
| os | string | `"Android 14"`, `"Windows 11"` |

### IPAddress
Originating IP address at onboarding. Shared IPs in a short time window suggest a single operator.

| Property | Type | Example |
|----------|------|---------|
| address | string | `"192.168.1.10"` |
| riskScore | int | 0–100 (from IP enrichment) |
| country | string | `"IN"` |

### Email
Verified email address. Used for pattern matching across merchants.

| Property | Type | Example |
|----------|------|---------|
| address | string | `"rajesh@example.com"` |
| domain | string | `"example.com"` |

### Phone
Contact phone number.

| Property | Type | Example |
|----------|------|---------|
| number | string | `"9876543210"` |
| carrier | string | `"Airtel"`, `"Jio"` |

### FraudCase
Container for a confirmed fraud investigation. Once a merchant is confirmed fraudulent, all linked merchants are automatically re-evaluated.

| Property | Type | Example |
|----------|------|---------|
| id | string | `"FC-009"` |
| severity | string | `"low"`, `"medium"`, `"high"`, `"critical"` |
| description | string | `"Confirmed synthetic identity ring — 5 merchants, shared devices, fake GST registrations"` |
| discoveredAt | datetime | `"2026-06-29T04:05:44.000Z"` |

---

## Relationships (6 relationships)

```
(:Merchant)
  -[:USES_DEVICE]->(:Device)
  -[:USES_IP]->(:IPAddress)
  -[:USES_EMAIL]->(:Email)
  -[:USES_PHONE]->(:Phone)
  -[:PAYS_OUT_TO]->(:BankAccount)
  -[:FLAGGED_IN]->(:FraudCase)
```

| Relationship | From | To | Meaning |
|-------------|------|----|---------|
| USES_DEVICE | Merchant | Device | Merchant onboarded using this device |
| USES_IP | Merchant | IPAddress | Merchant onboarded from this IP address |
| USES_EMAIL | Merchant | Email | Merchant's verified email address |
| USES_PHONE | Merchant | Phone | Merchant's phone number on file |
| PAYS_OUT_TO | Merchant | BankAccount | Merchant routes payouts to this account |
| FLAGGED_IN | Merchant | FraudCase | Merchant has been confirmed as part of this fraud ring |

---

## Example Cypher Queries

### Query 1: Find merchants sharing a device
Used by `shared-device.query.ts` in the risk scoring step.

```cypher
MATCH (m1:Merchant)-[:USES_DEVICE]->(d:Device)<-[:USES_DEVICE]-(m2:Merchant)
WHERE m1.id <> m2.id AND d.fingerprint = 'D-773'
RETURN d.fingerprint AS device,
       collect(DISTINCT m1.name) + collect(DISTINCT m2.name) AS merchants,
       count(DISTINCT m1) + count(DISTINCT m2) AS merchantCount
```

**Returns:** All merchants sharing device D-773, grouped by device. Used to assign the +25 shared device risk weight.

### Query 2: Find merchants sharing a bank account
```cypher
MATCH (m1:Merchant)-[:PAYS_OUT_TO]->(b:BankAccount)<-[:PAYS_OUT_TO]-(m2:Merchant)
WHERE m1.id <> m2.id
WITH b.accountNumber AS account, collect(DISTINCT m1.name) + collect(DISTINCT m2.name) AS merchants
WHERE size(merchants) >= 3
RETURN account, merchants, size(merchants) AS merchantCount
ORDER BY merchantCount DESC
```

**Returns:** Bank accounts shared by 3+ merchants. Used for the +35 shared bank account risk weight.

### Query 3: Suspicious paths — merchant to confirmed fraud case
```cypher
MATCH path = (m:Merchant)-[:USES_DEVICE|USES_IP|PAYS_OUT_TO*1..2]-(:Merchant)-[:FLAGGED_IN]->(fc:FraudCase)
WHERE m.name = 'Rajesh Kumar Traders'
RETURN path
LIMIT 10
```

**Returns:** Any path (≤2 hops) from a target merchant to a confirmed FraudCase. A direct hit adds +35 to risk score.

### Query 4: Full investigation subgraph for one merchant
Used by `investigation-subgraph.query.ts` when opening an investigation detail view.

```cypher
MATCH (m:Merchant {id: 'm-218'})
OPTIONAL MATCH (m)-[:USES_DEVICE]->(d:Device)<-[:USES_DEVICE]-(shared:Merchant)
OPTIONAL MATCH (m)-[:PAYS_OUT_TO]->(b:BankAccount)<-[:PAYS_OUT_TO]-(shared)
OPTIONAL MATCH (shared)-[:FLAGGED_IN]->(fc:FraudCase)
RETURN m, collect(DISTINCT d), collect(DISTINCT b), collect(DISTINCT shared), collect(DISTINCT fc)
```

**Returns:** The merchant's full neighborhood — their nodes, shared entity nodes, linked merchants, and any fraud cases. This populates the Path Explorer UI.

### Query 5: Find fraud rings (3+ merchants sharing 2+ entities)
The crown jewel query — detects coordinated fraud rings by requiring overlap on multiple dimensions.

```cypher
MATCH (m1:Merchant)-[:USES_DEVICE|PAYS_OUT_TO]->(shared)<-[:USES_DEVICE|PAYS_OUT_TO]-(m2:Merchant)
WHERE m1.id <> m2.id
WITH m1, m2, shared, labels(shared) AS sharedType
WITH m1, m2, count(DISTINCT shared) AS overlapCount, collect(DISTINCT sharedType) AS types
WHERE overlapCount >= 2
RETURN m1.name AS merchantA, m2.name AS merchantB, overlapCount, types
ORDER BY overlapCount DESC
```

**Returns:** Merchant pairs that share 2+ entities (e.g., same device AND same bank account). These are high-confidence fraud ring members.

---

## Risk Scoring from Graph

Cypher query results feed into the weighted scoring algorithm:

| Signal | Cypher Source | Weight |
|--------|---------------|--------|
| Shared bank account with flagged merchant | Query 3 (path to FraudCase via bank) | +35 |
| Shared device with 2+ merchants | Query 1 | +25 |
| Shared IP with flagged case | Query 3 (path to FraudCase via IP) | +15 |
| Payout change within 24h of onboarding | Not graph-based — PostgreSQL timestamp check | +10 |
| Multiple profile edits in 1 hour | Not graph-based — PostgreSQL audit log | +10 |
| Contact pattern anomaly (email/phone mismatch) | Not graph-based — enrichment service | +5 |

**Score → Risk Level:**
- 0–29 → `low`
- 30–59 → `medium`
- 60–100 → `high`
