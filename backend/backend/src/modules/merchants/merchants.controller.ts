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
