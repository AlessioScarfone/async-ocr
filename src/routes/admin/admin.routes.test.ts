import 'jest';
import * as express from 'express';
import request from 'supertest';
import BootstrapHelpers from '../../tests/helper/integration-helpers';
import env from '../../config/env';

describe('Admin Router tests', () => {
    let app: express.Application;
    beforeAll(async () => {
        app = await BootstrapHelpers.getApp();
    });

    it('can get server health', async () => {
        const response = await request(app).get('/api/admin/health');
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("ok");
    });

    it('can open bull monitor page', async () => {
        // console.log(env.monitor);
        if (env.bullMonitor.enabled && env.bullMonitor.page) {
            const response = await request(app)
                .get(`${env.bullMonitor.page}`)
                .auth(env.admin.user, env.admin.password || "");

            expect(response.statusCode).toBe(200);
        } else {
            console.log('TEST (can open status page): Status page not available');
        }
    })

    it('can open swagger page', async () => {
        // console.log(env.monitor);
        if (env.swagger.enabled && env.swagger.page) {
            const response = await request(app)
                .get(`${env.swagger.page}`)
                .auth(env.admin.user, env.admin.password || "");

            expect(response.statusCode === 200 || response.statusCode === 301).toBeTruthy()
        } else {
            console.log('TEST (can open status page): Status page not available');
        }
    })
});