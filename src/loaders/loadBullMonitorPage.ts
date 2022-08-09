import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Express } from "express";
import env from "../config/env";
import expressBasicAuth from "express-basic-auth";
import { nanoid } from "nanoid";
import RedisBullQueueManger from "../services/Redis/RedisBullQueueManager";

const loadBullMonitorPage = (app: Express) => {
    if (env.bullMonitor.enabled && env.bullMonitor.page && env.bullMonitor.user && env.bullMonitor.password) {
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath(env.bullMonitor.page);

        const queues =  RedisBullQueueManger.getInstance().getQueueList();

        if (queues.length == 0)
            console.warn(">> Bull Monitor Page: empty queue list <<");

        createBullBoard({
            queues: queues.map(e => new BullAdapter(e)),
            serverAdapter
        })

        const users: { [key: string]: string } = {
            [env.bullMonitor.user]: env.bullMonitor.password
        }

        app.use(env.bullMonitor.page, expressBasicAuth({
            users,
            challenge: true,
            realm: nanoid()
        }), serverAdapter.getRouter());
        console.log(">> Bull Monitor configured <<")
    } else {
        console.log(">> Bull Monitor not configured <<")
    }
}

export default loadBullMonitorPage;