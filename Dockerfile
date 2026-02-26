FROM node:20-alpine

WORKDIR /app

# Install git for guardrails-check.mjs
RUN apk add --no-cache git

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Default: run tests
CMD ["npm", "test"]
