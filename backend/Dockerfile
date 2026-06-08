FROM node:20-slim

WORKDIR /app

# Install build dependencies for native modules (like bcrypt)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Install all dependencies (including devDependencies) to compile TypeScript
RUN npm install

COPY . .

RUN npm run build

# Prune devDependencies to keep image size small
RUN npm prune --production

EXPOSE 5000

CMD ["node", "dist/server.js"]
