FROM node:20-alpine

# Set root working directory for monorepo
WORKDIR /app

# Copy entire monorepo including certs
COPY . .

# ✅ Explicitly copy certs to /app/certs inside image
COPY apps/processor/certs ./certs

WORKDIR /app/apps/processor

RUN npm install

CMD ["npm","run","dev"]
