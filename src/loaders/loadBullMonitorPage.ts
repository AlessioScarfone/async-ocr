import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Express } from "express";
import env from "../config/env";
import expressBasicAuth from "express-basic-auth";
import RedisBullQueueManger from "../services/Redis/RedisBullQueueManager";
import { getAdminBasicAuthConfig } from "../config/basicAuth";

const loadBullMonitorPage = (app: Express): boolean => {

    const basicAuthConfig = getAdminBasicAuthConfig();

    if (env.bullMonitor.enabled && env.bullMonitor.page) {
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath(env.bullMonitor.page);

        const queues =  RedisBullQueueManger.getInstance().getQueueList();

        if (queues.length == 0)
            console.warn(">> Bull Monitor Page: empty queue list <<");

        createBullBoard({
            queues: queues.map(e => new BullAdapter(e)),
            serverAdapter
        })

        if(basicAuthConfig)
            app.use(env.bullMonitor.page, expressBasicAuth(basicAuthConfig), serverAdapter.getRouter());
        else
            app.use(env.bullMonitor.page, serverAdapter.getRouter());

        console.log(">> Bull Monitor configured <<")
        return true;
    } else {
        console.log(">> Bull Monitor not configured <<")
        return false;
    }
}

export default loadBullMonitorPage;