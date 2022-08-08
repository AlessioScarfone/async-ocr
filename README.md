# Aync OCR

## Architecture
TODO

## Script
TODO

## Loadtest
`loadtest -n 20 -c 5 -P '{"url": "https://tesseract.projectnaptha.com/img/eng_bw.png","lang": "eng"}' http://localhost:8080/api/ocr/recognition -T application/json`

## Run Redis
1. `docker pull redis`

2. `"redis": "docker run --name redis -d -p 6379:6379 redis redis-server --requirepass 'redispassword'"`

### Redis utils command

- **List all queue:** <br/> `smembers rsmq:QUEUES`
- **Clean all data:** <br/> `FLUSHDB` and `FLUSHALL`
- **Get value type:** <br/> `TYPE rsmq:recognize_eng:Q`
- **List all keys:** <br/> `KEYS *`