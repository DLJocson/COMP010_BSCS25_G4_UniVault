# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY 2_backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend code
COPY 2_backend/ ./

# Copy frontend files
COPY 1_frontend/ ./public/

# Create uploads directory
RUN mkdir -p uploads logs

# Set permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
