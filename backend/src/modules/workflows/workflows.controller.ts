import { Router, Request, Response } from 'express';
import { WorkflowsService } from './workflows.service';
import { WorkflowsRepository } from './workflows.repository';

const router = Router();
const service = new WorkflowsService(new WorkflowsRepository());

router.post('/run', async (req: Request, res: Response) => {
  try {
    const workflow = await service.runForRiskDecision(req.body);
    res.status(201).json(workflow);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'failed' });
  }
});

router.get('/transaction/:transactionId', async (req: Request, res: Response) => {
  try {
   const workflow = await service.getByTransaction(String(req.params.transactionId));
    res.json(workflow);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'not found' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
   const workflow = await service.getById(String(req.params.id));
    res.json(workflow);
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'not found' });
  }
});

export default router;