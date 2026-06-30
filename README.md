# Vanguard Graph
**Fraud Coordination Intelligence Engine — Catch fraud rings before money moves.**

> Built for Namespace Hackathon AH6926 • Neo4j Track • Render Workflows Track

---

## The Problem

Platforms verify individual merchants at onboarding. They check if *this* email is valid, if *this* bank account is real. But they miss the pattern: **Merchant A shares a device with Merchant B, who routes payouts to the same bank account as flagged Merchant C.** Flat SQL checks can't see the graph.

## The Solution

Vanguard Graph connects every signal into a Neo4j knowledge graph — devices, IPs, bank accounts, emails, phones — then traverses second-degree connections to detect coordinated fraud rings that individual checks would miss. An AI investigator (Claude) translates graph findings into plain-language risk memos. Render Workflows powers the durable investigation pipeline.

---

## Hero Features

- **🔄 Ring Replay** — Visual timeline of how a fraud ring assembled. See each merchant join, each shared device appear, each bank account link. Play forward, pause, inspect.
- **🧠 Explainable AI Risk Memo** — Claude claude-sonnet-4-6 converts raw Cypher output into readable investigator notes: *"Merchant shares device D-773 with 4 others. Two route to bank account #4421, already linked to a confirmed fraud case."*
- **🕸️ Path Explorer** — Click any merchant node. Graph highlights direct and second-degree connections. One click from a merchant to their fraud ring.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Prisma |
| Graph DB | Neo4j AuraDB |
| Workflow Engine | Render Workflows |
| AI | Claude claude-sonnet-4-6 (Anthropic) |
| Relational DB | PostgreSQL (Neon) |
| Cache / Rate Limiting | Redis (Upstash) |

## Architecture

```
                         ┌──────────────────┐
                         │   Next.js App    │
                         │ (Frontend, TS)   │
                         └────────┬─────────┘
                                  │ REST API
                         ┌────────▼─────────┐
                         │  Express Server  │
                         │ (Backend, TS)    │
                         └──┬────┬────┬─────┘
                            │    │    │
                    ┌───────┘    │    └──────────┐
                    ▼            ▼               ▼
             ┌──────────┐ ┌──────────┐ ┌────────────────┐
             │PostgreSQL│ │  Redis   │ │   Neo4j AuraDB │
             │(Prisma)  │ │(Upstash) │ │ (Knowledge     │
             │          │ │          │ │  Graph)        │
             └──────────┘ └──────────┘ └────────────────┘
                                         │
                                    ┌────▼────┐
                                    │ Render  │
                                    │Workflows│
                                    └────┬────┘
                                         │
                                    ┌────▼────┐
                                    │ Claude  │
                                    │ AI      │
                                    └─────────┘
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/krrish2803/vanguard-graph-.git
cd vanguard-graph-

# Backend
cd backend
npm install
cp .env.example .env        # fill in your values
npx prisma migrate deploy
npm run seed
npm run dev                 # starts on :4000

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev                 # starts on :3000
```

---

## API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/merchants | Onboard new merchant |
| GET | /api/v1/merchants | List merchants (paginated, filterable) |
| GET | /api/v1/merchants/:id | Get merchant by ID |
| PATCH | /api/v1/merchants/:id | Update merchant |
| POST | /api/v1/merchants/:id/payout-change | Trigger payout change workflow |
| GET | /api/v1/alerts | List alerts (filterable) |
| GET | /api/v1/alerts/:id | Get alert by ID |
| PATCH | /api/v1/alerts/:id/status | Update alert status |
| GET | /api/v1/health | System health check |

Full docs at [`docs/api-reference.md`](docs/api-reference.md).

---

## Team

| Name | Role |
|------|------|
| Krrish | Frontend + Core Backend (Server, Merchants, Alerts) + Docs + PPT |
| Anurag | Neo4j Graph Schema + Fraud Detection Rules + Risk Scoring + Backend APIs |
| Naitik | Render Workflows + AI Layer (Claude integration) + Enrichment Services |
| Shreya | Full Frontend (all pages, components, features) |

---

## Hackathon Tracks

| Track | How We Use It |
|-------|---------------|
| ✅ Neo4j AuraDB | Knowledge graph of merchants, devices, bank accounts, IPs — Cypher queries detect shared entities and multihop fraud patterns |
| ✅ Render Workflows | Durable async pipelines for merchant onboarding investigation and payout-change re-evaluation — retry-safe, checkpoint-recoverable |
