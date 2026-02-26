FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Default: run tests
CMD ["npm", "test"]
