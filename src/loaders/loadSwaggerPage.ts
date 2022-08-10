import { Express } from "express";

import swaggerDocument from "../config/swagger/openapi.json";
import swaggerUi from 'swagger-ui-express';
import expressBasicAuth from "express-basic-auth";
import { nanoid } from "nanoid";
import env from "../config/env";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

const loadSwaggerPage = (app: Express): boolean => {
    if (env.swagger.enabled && env.swagger.page && env.swagger.user && env.swagger.password) {
        updateDynamicSwaggerValue(swaggerDocument);

        const users: { [key: string]: string } = {
            [env.swagger.user]: env.swagger.password
        }

        app.use(
            env.swagger.page,
            expressBasicAuth({
                users,
                challenge: true,
                realm: nanoid()
            }),
            swaggerUi.serve,
            swaggerUi.setup(swaggerDocument)
        );
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