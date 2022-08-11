import { RedisClientOptions } from "redis";
import env from "./env";

const RedisConnectionOption: RedisClientOptions & { host?: string, port?: string } = {
    url: env.redis.url || "redis://127.0.0.1:6379"
}

if (RedisConnectionOption.url) {
    if (RedisConnectionOption.url.includes("@")) {
        //Redis url with password
        const [userData, connectionData] = RedisConnectionOption.url.split("://")[1].split("@");
        [RedisConnectionOption.host, RedisConnectionOption.port] = connectionData.split(":");
        [RedisConnectionOption.username, RedisConnectionOption.password] = userData.split(":");
    } else {
        [RedisConnectionOption.host, RedisConnectionOption.port] = RedisConnectionOption.url.split("://")[1].split(":");
    }
}

export default RedisConnectionOption;
