import { Express } from "express";
import env from "../config/env";
import monitor from 'express-status-monitor';
import monitorConfig from "../config/monitor.config";
import expressBasicAuth from "express-basic-auth";
import { getAdminBasicAuthConfig } from "../config/basicAuth";

const loadMonitorPage = (app: Express): boolean => {
    const basicAuthConfig = getAdminBasicAuthConfig();

    if (env.monitor.enabled && env.monitor.page) {
        const statusMonitor = monitor(monitorConfig([
            {
                protocol: 'http',
                host: 'localhost',
                path: '/api/admin/health',
                port: env.port
            }
        ], ''));
        app.use((statusMonitor as any).middleware); // use the "middleware only" property to manage websockets

        if(basicAuthConfig)
            app.get(`${env.monitor.page}`, expressBasicAuth(basicAuthConfig), (statusMonitor as any).pageRoute); // use the pageRoute property to serve the dashboard html page
        else
            app.get(`${env.monitor.page}`, (statusMonitor as any).pageRoute); // use the pageRoute property to serve the dashboard html page

        console.log(">> Monitor configured <<")
        return true;
    } else {
        console.log(">> Monitor not configured <<")
        return false;
    }
}

export default loadMonitorPage;