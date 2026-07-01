import dotenv from "dotenv";
dotenv.config();

import neo4j from "neo4j-driver";
import neo4j from "neo4j-driver";


export const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || "neo4j",
    process.env.NEO4J_PASSWORD || "password"
  )
);

export async function getSession() {
  return neo4jDriver.session();
}

export async function verifyNeo4jConnection(): Promise<void> {
  const session = await getSession();
  try {
    await session.run("RETURN 1");
    console.log("✅ Neo4j connected");
  } catch (err) {
    console.error("❌ Neo4j connection failed:", err);
    throw err;
  } finally {
    await session.close();
  }
}
