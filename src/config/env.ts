function toBool(value: string | undefined | null): boolean {
    return value === 'true';
}

/**
 * Get `required` env variable
 * @param key
 * @returns 
 */
function getEnv(key: string): string {
    if (typeof process.env[key] === 'undefined') {
        throw new Error(`Environment variable ${key} is not set.`);
    }

    return process.env[key] as string;
}

function toNumber(value: string): number {
    return parseInt(value, 10);
}

const env = {
    node_env: process.env.NODE_ENV || "production",
    port: process.env.PORT || 8080,
    monitor: {
        enabled: toBool(process.env.MONITOR_ENABLED),
        page: process.env.MONITOR_ROUTE,
        user: process.env.MONITOR_USERNAME,
        password: process.env.MONITOR_PASSWORD
    },
    redis: {
        password: process.env.REDIS_PASSWORD,
        user: process.env.REDIS_USERNAME,
        port: process.env.REDIS_PORT || "6379",
        host: process.env.REDIS_HOST || "127.0.0.1",
        queuePrefix: process.env.REDIS_QUEUE_RECOGNIZE || "recognize_",
        expiracy: toNumber(process.env.REDIS_EXPIRACY || "21600") 
    }
}

export default env;