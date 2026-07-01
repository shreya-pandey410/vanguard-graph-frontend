import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import neo4j, { Driver } from 'neo4j-driver';

const NEO4J_URI = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER ?? 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD ?? 'password';

console.log('>>> ALL ENV KEYS:', Object.keys(process.env).filter(k => k.includes('NEO4J')));
console.log('Connecting to:', process.env.NEO4J_URI);

// ... baaki sab same (driver, verifyConnection, closeDriver)
console.log('User:', process.env.NEO4J_USER);
const driver: Driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionTimeout: 30000, // 30s
  },
);

// Startup pe connection verify kar — galat creds/DB down ho to abhi pata chal jaye
export async function verifyConnection(): Promise<void> {
  try {
    await driver.verifyConnectivity();
    console.log('✅ Neo4j connected');
  } catch (err) {
    console.error('❌ Neo4j connection failed:', err);
    throw err;
  }
}

// App band hote waqt driver close kar — warna connections leak hongi
export async function closeDriver(): Promise<void> {
  await driver.close();
  console.log('Neo4j driver closed');
}
console.log('Connecting to:', process.env.NEO4J_URI);
console.log('User:', process.env.NEO4J_USER);
// password mat print karna

export default driver;