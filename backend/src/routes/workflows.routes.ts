import { Router } from "express";
import {
  triggerWorkflow,
  getInvestigation,
  listInvestigations,
  takeAction,
} from "../modules/workflows/workflows.controller";

export const workflowRoutes = Router();

// POST /api/workflows/trigger — start an investigation
workflowRoutes.post("/trigger", triggerWorkflow);

// GET /api/workflows — list all investigations
workflowRoutes.get("/", listInvestigations);

// GET /api/workflows/:id — get one investigation by ID
workflowRoutes.get("/:id", getInvestigation);

// POST /api/workflows/:id/action — investigator takes action
workflowRoutes.post("/:id/action", takeAction);
