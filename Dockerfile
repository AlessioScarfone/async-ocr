FROM node:16.16-alpine3.15

WORKDIR /project

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

RUN cp traineddata_lang/* .

RUN npm prune --production

RUN rm -rf src traineddata_lang package-lock.json tsconfig.build.json tsconfig.json

RUN ls

CMD npm run prod