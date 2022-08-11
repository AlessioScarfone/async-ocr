import expressBasicAuth from "express-basic-auth";
import { nanoid } from "nanoid";
import env from "./env";

const basicAuthRealm = nanoid();

export const getAdminBasicAuthConfig = (): expressBasicAuth.BasicAuthMiddlewareOptions | null => {
    if (env.admin.user && env.admin.password) {
        const adminUsers: { [key: string]: string } = {
            [env.admin.user]: env.admin.password
        }

        return {
            users: adminUsers,
            challenge: true,
            realm: basicAuthRealm
        }
    }
    return null;
}