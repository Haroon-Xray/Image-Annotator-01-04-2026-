# Use Node 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=development \
    VITE_HOST=0.0.0.0 \
    VITE_PORT=5173

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire frontend application
COPY . .

# Expose port 5173 for Vite development server
# (Or 3000 if using a different setup - adjust docker-compose as needed)
EXPOSE 5173

# Default command: run Vite development server
# Vite will be accessible from outside container with 0.0.0.0 binding
CMD ["npm", "run", "dev"]
