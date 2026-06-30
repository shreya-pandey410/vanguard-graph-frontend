<<<<<<< HEAD
import { Router, Request, Response } from 'express';
import { MerchantsService } from './merchants.service';
import { MerchantsRepository } from './merchants.repository';
import { createMerchantSchema } from './merchants.schemas';

const router = Router();
const service = new MerchantsService(new MerchantsRepository());

router.post('/', async (req: Request, res: Response) => {
  const parsed = createMerchantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  try {
    const merchant = await service.create(parsed.data);
    res.status(201).json(merchant);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'failed' });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json(await service.getAll());
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'failed' });
  }
});

// NOTE: ye route '/:merchantId' se PEHLE hona chahiye, warna 'risk-profile'
// ko merchantId samajh lega Express
router.get('/:merchantId/risk-profile', async (req: Request, res: Response) => {
  try {
   res.json(await service.getRiskProfile(String(req.params.merchantId)));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'not found' });
  }
});

router.get('/:merchantId', async (req: Request, res: Response) => {
  try {
    res.json(await service.getRiskProfile(String(req.params.merchantId)));
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'not found' });
  }
});

export default router;
=======
import { Request, Response, NextFunction } from 'express'
import { MerchantsService } from './merchants.service'
import { CreateMerchantSchema, UpdateMerchantSchema, MerchantQuerySchema, PayoutChangeSchema } from './merchants.schemas'

export class MerchantsController {
  constructor(private service: MerchantsService) {}

  createMerchant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = CreateMerchantSchema.parse(req.body)
      const merchant = await this.service.createMerchant(data)
      res.status(201).json({ success: true, data: merchant })
    } catch (err) {
      next(err)
    }
  }

  getMerchants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = MerchantQuerySchema.parse(req.query)
      const result = await this.service.getMerchants(query)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }

  getMerchantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const merchant = await this.service.getMerchantById(req.params.id as string)
      res.json({ success: true, data: merchant })
    } catch (err) {
      next(err)
    }
  }

  updateMerchant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = UpdateMerchantSchema.parse(req.body)
      const merchant = await this.service.updateMerchant(req.params.id as string, data)
      res.json({ success: true, data: merchant })
    } catch (err) {
      next(err)
    }
  }

  triggerPayoutChange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = PayoutChangeSchema.parse(req.body)
      const merchant = await this.service.triggerPayoutChange(req.params.id as string, data)
      res.json({ success: true, data: merchant })
    } catch (err) {
      next(err)
    }
  }
}
>>>>>>> upstream/main
