<<<<<<< HEAD
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { verifyConnection, closeDriver } from "./services/neo4j/driver"
import graphController from './modules/graph/graph.controller';
import merchantsController from './modules/merchants/merchants.controller';
import alertsController from './modules/alerts/alerts.controller';
import workflowsController from './modules/workflows/workflows.controller';



verifyConnection(); // server start hone se pehle

// graceful shutdown
process.on('SIGINT', async () => {
  await closeDriver();
  process.exit(0);
});

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));
app.use('/graph', graphController);
app.use('/merchants', merchantsController);
app.use('/alerts', alertsController);
app.use('/workflows', workflowsController);


app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message: "Fraud detection is running"
    });
});

 export default app;
=======
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
>>>>>>> upstream/main
