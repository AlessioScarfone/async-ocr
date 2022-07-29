import 'jest';
import RedisClient from '../../services/Redis/RedisClient';
import RedisPublisher from '../../services/Redis/RedisPublisher';
import RedisSubscriber from '../../services/Redis/RedisSubscriber';
import { jestWait } from '../helper/integration-helpers';

jest.setTimeout(15000);

describe('Redis Client', () => {
    let redisClient: RedisClient;
    let redisPublisher: RedisPublisher;
    let redisSubscriber: RedisSubscriber;
    const channel = "jest_test";
    const subscribedMsg: string[] = [];

    beforeAll(async () => {
        redisClient = RedisClient.getInstance();
        redisPublisher = new RedisPublisher(redisClient.client, channel);
        redisSubscriber = new RedisSubscriber(redisClient.client, channel);

        await redisClient.connect();
        await redisPublisher.connect();
        await redisSubscriber.connect();

        await redisSubscriber.subscribe(
            (msg: string) => {
                console.log("Subscriber Read:", msg);
                subscribedMsg.push(msg);
            }
        )
    })

    afterAll(async () => {
        await redisClient.disconnect();
        await redisPublisher.disconnect();
        await redisSubscriber.unsubscribe();
        await redisSubscriber.disconnect();
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

    it('Redis Pub/Sub', async () => {
        expect(subscribedMsg.length).toEqual(0);
        const msg = "test message";
        const pubRes = await redisPublisher.publish(msg);
        expect(pubRes).toEqual(1);
        await jestWait(500);
        expect(subscribedMsg.length).toBeGreaterThan(0);
        console.log(subscribedMsg);
    })

    //ultimo test
    it('Redis exception if not connected', async () => {
        await redisClient.disconnect();
        expect(redisClient.writeMessage("a", "b")).rejects.toEqual("Redis Client not ready");
    })
});