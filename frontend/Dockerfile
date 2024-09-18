FROM node:22.9-alpine3.19 as build

RUN npm install -g pnpm@9.10.0

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:22.9-alpine3.19

WORKDIR /app

COPY --from=build /app/.output ./

EXPOSE 3000

CMD [ "node", "server/index.mjs" ]