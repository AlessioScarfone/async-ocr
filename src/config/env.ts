/* eslint-disable @typescript-eslint/no-unused-vars */

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

export function isProd() {
    return env.node_env === "production"
}

const env = {
    node_env: process.env.NODE_ENV || "production",
    port: process.env.PORT || 8080,
    redis: {
        url: process.env.REDIS_URL,
        // password: process.env.REDIS_PASSWORD,
        // username: process.env.REDIS_USERNAME,
        // port: process.env.REDIS_PORT || "6379",
        // host: process.env.REDIS_HOST || "127.0.0.1",
        queuePrefix: process.env.REDIS_QUEUE_RECOGNIZE || "recognize_",
        expiracy: toNumber(process.env.REDIS_EXPIRACY || "21600") 
    },
    bullMonitor: {
        enabled: toBool(process.env.BULL_MONITOR_ENABLED),
        page: process.env.BULL_MONITOR_ROUTE || "/admin/bull",
    },
    swagger: {
        enabled: toBool(process.env.SWAGGER_ENABLED),
        page: process.env.SWAGGER_ROUTE || "/admin/api-docs",
        showAdminSection: toBool(process.env.SWAGGER_SHOW_ADMIN_SECTION) || false
    },
    admin: {
        user: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD
    },
    rapidApi: {
        proxySecret: process.env.RAPID_API_PROXY_SECRET
    },
    log: {
        tesseractCoreEnabled: toBool(process.env.LOG_TESSERACT_CORE_ENABLED)
    },
    file: {
        sizeLimit: toNumber(process.env.FILE_SIZE_LIMIT_BYTE ? process.env.FILE_SIZE_LIMIT_BYTE : "3000000")    //default 3MB
    }
}

export default env;