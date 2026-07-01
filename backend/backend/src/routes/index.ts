import { Router } from 'express'
import merchantsRoutes from './merchants.routes'
import alertsRoutes from './alerts.routes'
import healthRoutes from './health.routes'

const router = Router()

router.use('/merchants', merchantsRoutes)
router.use('/alerts', alertsRoutes)
router.use('/health', healthRoutes)

// Placeholder routes for teammates:
// TODO: Anurag will implement /graph routes
// TODO: Anurag will implement /investigations routes
// TODO: Naitik will implement /workflows routes

export default router
