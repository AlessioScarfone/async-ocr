import express, { Express, Request, Response } from "express";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import * as Routers from "./routes";
import requestIDMiddleware from "./middlewares/request-id.middleware";
import loadMonitorPage from "./loaders/loadMonitorPage";
import loadHelmetMiddleware from "./loaders/loadHelmetMiddleware";
import loadBullMonitorPage from "./loaders/loadBullMonitorPage";

let bullMonitorConfiguredEsit = false;

const EXPRESS_CONTEXT_KEY = {
  REDIS_CLIENT: "redisClient",
  REDIS_QUEUE_MANAGER: "redisQueueManager"
}

const loadExpressMiddleware = (app: Express) => {
  loadMonitorPage(app)
  bullMonitorConfiguredEsit = loadBullMonitorPage(app)
  
  loadHelmetMiddleware(app);
  app.use(cors());
  app.use(requestIDMiddleware());
  app.use(compression());
  app.use(express.text());
  app.use(express.json());
  app.use(errorHandlerMiddleware);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  morgan.token('body', (req: Request, res: Response): string => JSON.stringify(req.body));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  morgan.token('requestID', (req: Request, res: Response): string => req.requestID);
  app.use(morgan('[:date[clf]] :method :url :status [:requestID] :response-time ms - body = :body'));
}

const logRegisteredRoutes = (app: Express) => {
  console.log("\n========= Registered Routes =========")
  const routes = app._router.stack.map((middleware: any) => {
    if (middleware.route)
      return { path: middleware?.route?.path, methods: middleware?.route?.methods }
    else if (middleware.name == 'router') {
      //routes attached to a router
      return middleware.handle.stack.map((handler: any) => {
        return { path: handler?.route?.path, methods: handler?.route?.methods }
      })
    }
  }).flat(Infinity).filter((e: any) => e)

  if(bullMonitorConfiguredEsit) {
    routes.push({ path: '/admin/status/bull', methods: { get: true } })
  }
  console.log(routes);
  console.log("=====================================\n")
}


const createApp = (logRoute = true): Express => {
  const app: Express = express();
  loadExpressMiddleware(app);

  // attach router
  app.use('/', Routers.adminRouter);
  app.use('/', Routers.ocrRouter);

  if (logRoute)
    logRegisteredRoutes(app);

  return app;
}

export default createApp;
export { EXPRESS_CONTEXT_KEY }


