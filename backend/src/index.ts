import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { workflowRoutes } from "./routes/workflows.routes";
import { neo4jDriver } from "./config/neo4j";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vanguard-graph-backend", ts: new Date().toISOString() });
});

// Routes
app.use("/api/workflows", workflowRoutes);

// Graceful shutdown
process.on("SIGINT", async () => {
  await neo4jDriver.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Vanguard Graph backend running on port ${PORT}`);
});
