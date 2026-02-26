FROM node:20-alpine

# Install bash and git (needed for scripts and guardrails)
RUN apk add --no-cache bash git

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Default: run tests
CMD ["npm", "test"]
