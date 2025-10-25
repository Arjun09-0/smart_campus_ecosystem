# Backend Dockerfile for Smart Campus
# Uses a small Node image and installs production deps only
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package manifests first for cached installs
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose the port the app listens on
EXPOSE 5000

# Set production env
ENV NODE_ENV=production

# Start the app
CMD ["node", "server.js"]
