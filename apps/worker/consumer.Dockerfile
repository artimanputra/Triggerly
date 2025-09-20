FROM node:20-alpine

WORKDIR /app

COPY . .
COPY apps/worker/certs ./certs
WORKDIR /app/apps/worker

RUN npm install

CMD ["npm", "run", "dev"]
