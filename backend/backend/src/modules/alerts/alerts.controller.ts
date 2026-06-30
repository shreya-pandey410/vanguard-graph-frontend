import { Request, Response, NextFunction } from 'express'
import { AlertsService } from './alerts.service'
import { AlertQuerySchema, UpdateAlertStatusSchema } from './alerts.schemas'

export class AlertsController {
  constructor(private service: AlertsService) {}

  getAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = AlertQuerySchema.parse(req.query)
      const result = await this.service.getAlerts(query)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }

  getAlertById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.service.getAlertById(req.params.id as string)
      res.json({ success: true, data: alert })
    } catch (err) {
      next(err)
    }
  }

  updateAlertStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = UpdateAlertStatusSchema.parse(req.body)
      const alert = await this.service.updateAlertStatus(req.params.id as string, dto)
      res.json({ success: true, data: alert })
    } catch (err) {
      next(err)
    }
  }
}
