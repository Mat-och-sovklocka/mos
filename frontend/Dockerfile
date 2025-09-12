# Node 20 for Vite/React
FROM node:22-alpine

WORKDIR /app

# Install deps on container start (dev convenience)
# We'll still mount the project via a volume; node_modules will live in the container
# so hot reload works without touching your host's global node.
EXPOSE 3000

# Compose will run: npm install && npm run dev
CMD ["sh", "-c", "npm install && npm run dev"]
