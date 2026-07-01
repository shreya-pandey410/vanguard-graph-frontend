import { Router } from 'express'
import { AlertsController } from '../modules/alerts/alerts.controller'
import { AlertsService } from '../modules/alerts/alerts.service'
import { AlertsRepository } from '../modules/alerts/alerts.repository'

const repository = new AlertsRepository()
const service = new AlertsService(repository)
const controller = new AlertsController(service)

const router = Router()

router.get('/', controller.getAlerts)
router.get('/:id', controller.getAlertById)
router.patch('/:id/status', controller.updateAlertStatus)

export default router
