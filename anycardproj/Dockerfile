FROM node:22-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build   # assumes "build": "tsc"

# Expose the port Cloud Run expects
EXPOSE 8080

# Start server directly (no start.sh)
CMD ["node", "dist/server.js"]