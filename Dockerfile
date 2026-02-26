FROM node:20-alpine

# Install bash and git (needed for scripts and guardrails)
RUN apk add --no-cache bash git

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Fix git ownership issue (Docker copies files as root)
RUN git config --global --add safe.directory /app

# Default: run tests
CMD ["npm", "test"]
