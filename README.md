# Async OCR
<p style="text-align: center">
Asynchronous REST OCR API.
</p>

## Architecture
- TypeScript + Express
- Tesseract.js
- Redis
- Bull

> TODO: add process schema

### Available endpoint

> TODO:

### Example

> TODO:

## Script

- `start` : run on development mode 
- `start-prod` : run on production mode
- `test` : run test
- `build` : build project

## Install and run Redis via Docker
1. `docker pull redis`

2. `"redis": "docker run --name redis -d -p 6379:6379 redis redis-server --requirepass 'redispassword'"`

### Redis utils command

> [Redis Cheatsheet](https://quickref.me/redis)

- **Connect to Redis:** <br/> `redis-cli`
- **Login:** <br/> `AUTH [password]`
- **Clean all data:** <br/> `FLUSHDB` and `FLUSHALL`
- **Get value type:** <br/> `TYPE [key]`
- **List all keys:** <br/> `KEYS *`
- **Sorted set count:** <br/> `ZCARD bull:recognize_eng:failed`
- **Show Sorted set element:** <br/> `ZRANGE bull:recognize_eng:failed 0 0`
- **Read Hash:** <br/> `HGETALL bull:recognize_eng:419`

## Bull

> [Bull Reference](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md)

## Test

- Run unit test with `npm run test`.
- Run specific test case with `npm run test -- ${testNamePattern}`. (Es: `npm run test -- Redis` will run only `Redis.test.ts`)

### Loadtest
`loadtest -n 20 -c 5 -P '{"url": "https://tesseract.projectnaptha.com/img/eng_bw.png","lang": "eng"}' http://localhost:8080/api/ocr/recognition -T application/json`