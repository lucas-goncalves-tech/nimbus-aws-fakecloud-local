FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS development
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
ENV DB_FILE_NAME=/app/data/lms.sqlite
COPY . .
RUN npm run build \
    && npm prune --omit=dev \
    && mkdir -p /app/data \
    && chown -R node:node /app
USER node
EXPOSE 3333
CMD ["npm", "run", "start"]
