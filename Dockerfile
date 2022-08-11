FROM node:16.16-alpine3.15

WORKDIR /project

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

RUN rm -rf src

RUN npm prune --production

# RUN ls dist/services/Tesseract/lang

CMD npm run prod