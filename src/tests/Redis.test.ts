import 'jest';
import { env } from 'process';
import RedisBullQueueManger from '../services/Redis/RedisBullQueueManager';
import RedisClient from '../services/Redis/RedisClient';

jest.setTimeout(15000);

describe('Redis/Queue Test', () => {
    let redisClient: RedisClient;
    let bullQueueManger: RedisBullQueueManger;
    const queue = "jest_test";

    beforeAll(async () => {
        bullQueueManger = RedisBullQueueManger.getInstance();
        redisClient = RedisClient.getInstance();
        await redisClient.connect();
        bullQueueManger.createQueue(queue);
    })

    afterAll(async () => {
        await bullQueueManger.getQueue(queue)?.obliterate({ force: true });
        await bullQueueManger.disconnect();
        await redisClient.disconnect();
    })

    it('Redis url split', () => {
        const url = "redis://127.0.0.1:6379";
        const [host, port] = url.split("://")[1].split(":");
        expect(host).toEqual("127.0.0.1");
        expect(port).toEqual("6379");
    })
    it('Redis url with password split', () => {
        const url = "redis://default:redispassword@127.0.0.1:6379";
        const [userData, connectionData] = url.split("://")[1].split("@");
        const [host, port] = connectionData.split(":");
        const [username, password] = userData.split(":");
        expect(host).toEqual("127.0.0.1");
        expect(port).toEqual("6379");
        expect(username).toEqual("default");
        expect(password).toEqual("redispassword");
    })

    it('Redis Ping', async () => {
        const ping = await redisClient.ping();
        expect(ping).toEqual('PONG')
    })

    it('Redis Write/Read', async () => {
        const key = "key1";
        const value = "value1";
        await redisClient.writeMessage(key, value);
        const res = await redisClient.readMessage(key);
        const res2 = await redisClient.readMessage("not_existet_key");
        expect(res ? JSON.parse(res) : null).toBe(value);
        expect(res2).toBeNull();
    })

    it('Bull queue write/read', async () => {
        const data = { msg: "jest_test" }
        const res = await bullQueueManger.sendMessage(queue, data);
        expect(res).not.toBeNull();
        expect(res?.id).not.toBeNull();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const job = await bullQueueManger.getQueue(queue)?.getJob(res!.id);
        expect(job).not.toBeNull();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(job!.data).toEqual(data);
    })

});