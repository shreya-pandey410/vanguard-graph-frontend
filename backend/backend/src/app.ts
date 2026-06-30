import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestIdMiddleware } from './middleware/request-id.middleware'
import { rateLimitMiddleware } from './middleware/rate-limit.middleware'
import { authMiddleware } from './middleware/auth.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import routes from './routes'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(requestIdMiddleware)
app.use(rateLimitMiddleware)
app.use(authMiddleware)

app.use('/api/v1', routes)

app.use(errorMiddleware)

export default app
