# Node 22 for Vite/React
FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies in container (not mounted)
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev"]
