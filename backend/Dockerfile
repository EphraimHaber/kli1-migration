FROM node:22.9-alpine3.19 as build

RUN npm install -g pnpm@9.10.0

WORKDIR /app

COPY package.json ./

COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 8080

CMD npm run start
