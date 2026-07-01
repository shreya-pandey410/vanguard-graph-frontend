import dotenv from "dotenv";
dotenv.config();

import { getSession, neo4jDriver } from "../config/neo4j";

const DEMO_MERCHANTS = [
  { id: "M-001", name: "TechPay Solutions", device: "FP-DEMO-001", ip: "45.12.34.1", email: "merchant1@gmail.com", phone: "+1-555-0101", bank: "ACCT-442" },
  { id: "M-002", name: "QuickStore Ltd", device: "FP-DEMO-001", ip: "45.12.34.2", email: "merchant2@gmail.com", phone: "+1-555-0102", bank: "ACCT-442" },
  { id: "M-003", name: "FastShip Corp", device: "FP-DEMO-001", ip: "45.12.34.3", email: "merchant3@gmail.com", phone: "+1-555-0103", bank: "ACCT-999" },
  { id: "M-004", name: "GoodGoods Inc", device: "FP-CLEAN-001", ip: "203.0.113.1", email: "legit@company.com", phone: "+1-555-0201", bank: "ACCT-100" },
];

const FRAUD_CASES = [
  { id: "FC-001", description: "Merchant ring - shared device + payout account" },
];

async function seed() {
  const session = await getSession();
  try {
    console.log("🌱 Seeding Neo4j with demo data...");

    // Create fraud case
    for (const fc of FRAUD_CASES) {
      await session.run(
        `MERGE (fc:FraudCase {id: $id}) SET fc.description = $description`,
        fc
      );
    }

    // Create merchants and their entity relationships
    for (const m of DEMO_MERCHANTS) {
      await session.run(
        `MERGE (m:Merchant {id: $id}) SET m.businessName = $name
         MERGE (d:Device {fingerprint: $device})
         MERGE (ip:IPAddress {ip: $ip})
         MERGE (em:Email {email: $email})
         MERGE (ph:Phone {phone: $phone})
         MERGE (ba:BankAccount {account: $bank})
         MERGE (m)-[:USES_DEVICE]->(d)
         MERGE (m)-[:USES_IP]->(ip)
         MERGE (m)-[:USES_EMAIL]->(em)
         MERGE (m)-[:USES_PHONE]->(ph)
         MERGE (m)-[:PAYS_OUT_TO]->(ba)`,
        m
      );
    }

    // Link M-001, M-002 to fraud case
    await session.run(
      `MATCH (m:Merchant) WHERE m.id IN ['M-001', 'M-002']
       MATCH (fc:FraudCase {id: 'FC-001'})
       MERGE (m)-[:FLAGGED_IN]->(fc)`
    );

    console.log("✅ Demo data seeded successfully");
    console.log("   Merchants: M-001, M-002, M-003 share device FP-DEMO-001");
    console.log("   Merchants: M-001, M-002 share bank account ACCT-442");
    console.log("   Merchants: M-001, M-002 flagged in FC-001");
    console.log("   Merchant: M-004 is clean (no links)");
  } finally {
    await session.close();
    await neo4jDriver.close();
  }
}

seed().catch(console.error);
