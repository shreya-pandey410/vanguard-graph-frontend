# Deployment

Step-by-step guide to deploying Vanguard Graph in development and production.

---

## Prerequisites

- **Node.js 18+** — runtime
- **PostgreSQL** — Neon free tier (recommended), or any PostgreSQL 14+ instance
- **Redis** — Upstash free tier (recommended), or any Redis 7+ instance
- **Neo4j AuraDB** — free tier instance (required for graph features)
- **Render account** — for Workflows and backend hosting
- **Anthropic API key** — optional, mock provider works for development

---

## Environment Variables

All env vars across the entire project:

| Variable | Required By | Description | Example |
|----------|-------------|-------------|---------|
| `PORT` | Backend | Server port | `3001` |
| `NODE_ENV` | Backend | Environment mode | `development` |
| `DATABASE_URL` | Backend | Neon PostgreSQL connection string | `postgresql://user:pass@ep-long-hat.aws.neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | Backend | Upstash Redis TLS URL | `rediss://default:token@curious-tadpole-154935.upstash.io:6379` |
| `JWT_SECRET` | Backend | Random 32-byte hex string for JWT signing | `vanguard-graph-hackathon-secret-2025` |
| `NEO4J_URI` | Backend | AuraDB connection URI | `neo4j+s://12345678.databases.neo4j.io` |
| `NEO4J_USER` | Backend | AuraDB username | `neo4j` |
| `NEO4J_PASSWORD` | Backend | AuraDB password | `your-neo4j-password` |
| `ANTHROPIC_API_KEY` | Backend | Claude API key (optional — mock fallback) | `sk-ant-xxxxxxxxxxxx` |
| `RENDER_API_KEY` | Backend | Render Workflows API key | `rnd_xxxxxxxxxxxx` |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL for API calls | `http://localhost:3001` |

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/krrish2803/vanguard-graph-.git
cd vanguard-graph-
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — fill in DATABASE_URL, REDIS_URL, JWT_SECRET
# (Neo4j, Anthropic, and Render keys are optional for dev)

# Database
npx prisma migrate deploy
npm run seed

# Start development server (with hot reload)
npm run dev
```

Server starts at `http://localhost:3001`. Health check: `GET http://localhost:3001/api/v1/health`.

### 3. Frontend

```bash
cd ../frontend

# Create frontend env
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Install and start
npm install
npm run dev
```

Frontend starts at `http://localhost:3000`.

### 4. Verify

```bash
# Backend health
curl http://localhost:3001/api/v1/health
# → {"status":"ok","postgres":"connected","redis":"connected","timestamp":"..."}

# Create a test merchant
curl -X POST http://localhost:3001/api/v1/merchants \
  -H "Authorization: Bearer $(node -e "console.log(require('jsonwebtoken').sign({id:'admin',role:'admin'},'vanguard-graph-hackathon-secret-2025'))")" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Merchant","email":"test@example.com","phone":"9876543210","deviceFingerprint":"D-TEST","ipAddress":"10.0.0.1","bankAccountNumber":"123456789012","bankAccountIfsc":"HDFC0001234"}'
```

---

## Production Deployment

### Backend → Render Web Service

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npx prisma generate && npx prisma migrate deploy` |
| Start Command | `npm run start` |
| Root Directory | `backend` |

4. Add all environment variables from the table above
5. Deploy

### Frontend → Vercel

1. Connect GitHub repository to Vercel
2. Root directory: `frontend`
3. Framework: Next.js (auto-detected)
4. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL
5. Deploy

### Neo4j AuraDB

1. Create a free instance at https://console.neo4j.io
2. Copy connection URI, username, password
3. Add to backend environment variables

### Render Workflows

1. In Render dashboard, navigate to **Workflows**
2. Create two workflows:
   - `merchant-onboarding` — triggered by POST /merchants
   - `payout-change` — triggered by POST /merchants/:id/payout-change
3. Generate a Render API key → set as `RENDER_API_KEY` in backend env

---

## Database Commands

```bash
# Apply pending migrations
npx prisma migrate deploy

# Create a new migration (development)
npx prisma migrate dev --name describe_your_change

# Reset database (drops everything, re-migrates, re-seeds)
npm run reset-dev

# Re-seed data only
npm run seed

# View/edit data
npx prisma studio
```

---

## Seed Data

The seed script creates:

**20 merchants** with overlapping fraud signals:
- 5 sharing device fingerprint `D-773` (strong coordination signal)
- 3 sharing bank account ending `4421` (payout concentration)
- 4 from the same IP range `192.168.1.x` (likely single operator)
- 8 clean merchants (for contrast in demos)

**10 alerts** across risk levels:
- 3 HIGH risk (linked to overlapping merchants, open/under_review)
- 4 MEDIUM risk
- 3 LOW risk

---

## Verifying a Full Deployment

| Step | Command / Action | Expected |
|------|-----------------|----------|
| 1 | `curl /api/v1/health` | `{"status":"ok","postgres":"connected","redis":"connected"}` |
| 2 | Create merchant via POST | 201 with merchant record |
| 3 | List merchants via GET | Array with 21 merchants (20 seed + 1 new) |
| 4 | Open Neo4j AuraDB browser | Run `MATCH (n) RETURN n` — see nodes |
| 5 | Check alerts via GET | 10 seeded alerts returned |
| 6 | Open frontend | Graph renders, merchants table loads |
