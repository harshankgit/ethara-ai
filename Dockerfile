FROM node:18-alpine

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install packages
RUN npm install

# Copy project source code
COPY . .

# Set dev/build compatibility flags for Windows SWC issues during Docker builds
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application using Webpack configuration
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
