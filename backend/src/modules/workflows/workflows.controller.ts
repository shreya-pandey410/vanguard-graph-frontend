import { Request, Response } from "express";
import { MerchantEventSchema } from "./workflows.types";
import {
  triggerInvestigation,
  fetchInvestigation,
  fetchAllInvestigations,
  applyInvestigatorAction,
} from "./workflows.service";
import { z } from "zod";

export async function triggerWorkflow(req: Request, res: Response) {
  const parsed = MerchantEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }

  try {
    const result = await triggerInvestigation(parsed.data);
    return res.status(202).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getInvestigation(req: Request, res: Response) {
  const { id } = req.params;
  const inv = fetchInvestigation(id);
  if (!inv) return res.status(404).json({ error: "Investigation not found" });
  return res.json(inv);
}

export async function listInvestigations(_req: Request, res: Response) {
  return res.json(fetchAllInvestigations());
}

export async function takeAction(req: Request, res: Response) {
  const { id } = req.params;
  const { action } = req.body;

  const ActionSchema = z.enum(["APPROVE", "REVIEW", "BLOCK"]);
  const parsed = ActionSchema.safeParse(action);
  if (!parsed.success) {
    return res.status(400).json({ error: "Action must be APPROVE, REVIEW, or BLOCK" });
  }

  const ok = applyInvestigatorAction(id, parsed.data);
  if (!ok) return res.status(404).json({ error: "Investigation not found" });
  return res.json({ success: true, action: parsed.data });
}
