# Use Node.js LTS version
FROM node:18-slim

# Install pnpm globally (matching your packageManager version)
RUN npm install -g pnpm@8.6.10

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy lib package.json files (needed for workspace resolution)
COPY lib/common/package.json ./lib/common/
COPY lib/types/package.json ./lib/types/

# Copy backend package.json
COPY backend/package.json ./backend/

# Install all dependencies (pnpm will handle workspace dependencies)
RUN pnpm install --frozen-lockfile

# Copy source files for lib packages
COPY lib/common/ ./lib/common/
COPY lib/types/ ./lib/types/

# Copy backend source files
COPY backend/ ./backend/

# Copy TypeScript configs if needed
COPY tsconfig.json ./
COPY lib/common/tsconfig.json ./lib/common/
COPY lib/types/tsconfig.json ./lib/types/
COPY backend/tsconfig.json ./backend/

# Build workspace packages and backend
RUN pnpm build

# Expose the port (Google Cloud Run will set PORT env var)
EXPOSE 8080

# Set working directory to backend for runtime
WORKDIR /app/backend

# Start the server (using dist output)
CMD ["node", "dist/server.js"]
