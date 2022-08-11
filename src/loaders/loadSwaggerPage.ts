import { Express } from "express";

import swaggerDocument from "../config/swagger/openapi.json";
import swaggerUi from 'swagger-ui-express';
import expressBasicAuth from "express-basic-auth";
import env from "../config/env";
import { getAdminBasicAuthConfig } from "../config/basicAuth";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

const loadSwaggerPage = (app: Express): boolean => {

    const basicAuthConfig = getAdminBasicAuthConfig();

    if (env.swagger.enabled && env.swagger.page) {
        updateDynamicSwaggerValue(swaggerDocument);

        if (basicAuthConfig) {
            app.use(
                env.swagger.page,
                expressBasicAuth(basicAuthConfig),
                swaggerUi.serve,
                swaggerUi.setup(swaggerDocument)
            );
        } else {
            app.use(
                env.swagger.page,
                swaggerUi.serve,
                swaggerUi.setup(swaggerDocument)
            );
        }
        console.log(">> Swagger configured <<")
        return true;
    } else {
        console.log(">> Swagger not configured <<")
        return false;
    }
}

const updateDynamicSwaggerValue = (swagger: any) => {
    swagger.info.version = pkg.version;

    if (!env.swagger.showAdminSection) {
        console.log("Hide Admin endpoint from swagger", Object.keys(swagger.paths).filter(p => p.match(/.*admin.*/)));
        Object.keys(swagger?.paths)
            .filter(p => p.match(/.*admin.*/))
            .forEach(adminPath => { delete swagger.paths[adminPath] })

        swagger.tags = swagger.tags.filter((e: any) => e?.name != "Admin");
    }
}

export default loadSwaggerPage;