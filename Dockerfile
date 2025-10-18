FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build   # assumes "build": "tsc" in package.json

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
