import { Router, Request, Response } from 'express';
import { GraphService } from './graph.service';
import { GraphRepository } from './graph.repository';
import { string } from 'zod';

const router = Router();
const service = new GraphService(new GraphRepository());

// GET /graph/transaction/:transactionId?depth=2
router.get('/transaction/:transactionId', async (req: Request, res: Response) => {
  try {
    const depth = req.query.depth ? Number(req.query.depth) : 2;
    const graph = await service.getTransactionSubgraph(String(req.params.transactionId));
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'failed' });
  }
});

// GET /graph/fraud-rings?minAccounts=3
router.get('/fraud-rings', async (req: Request, res: Response) => {
  try {
    const minAccounts = req.query.minAccounts ? Number(req.query.minAccounts) : 2;
    const rings = await service.findFraudRings(minAccounts);
    res.json(rings);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'failed' });
  }
});

// GET /graph/path?from=acc1&to=acc2
router.get('/path', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params required' });
    }
    const graph = await service.findConnectionPath(String(from), String(to));
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'failed' });
  }
});

export default router;