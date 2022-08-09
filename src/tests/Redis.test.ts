import 'jest';
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

    //ultimo test
    it('Redis exception if not connected', async () => {
        await redisClient.disconnect();
        expect(redisClient.writeMessage("a", "b")).rejects.toEqual("Redis Client not ready");
    })
});