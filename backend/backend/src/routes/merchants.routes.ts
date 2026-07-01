import { Router } from 'express'
import { MerchantsController } from '../modules/merchants/merchants.controller'
import { MerchantsService } from '../modules/merchants/merchants.service'
import { MerchantsRepository } from '../modules/merchants/merchants.repository'

const repository = new MerchantsRepository()
const service = new MerchantsService(repository)
const controller = new MerchantsController(service)

const router = Router()

router.post('/', controller.createMerchant)
router.get('/', controller.getMerchants)
router.get('/:id', controller.getMerchantById)
router.patch('/:id', controller.updateMerchant)
router.post('/:id/payout-change', controller.triggerPayoutChange)

export default router
