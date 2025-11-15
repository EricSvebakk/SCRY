
# =====================================================================
# run prod
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
run npm ci

COPY . .
ARG NEXT_PUBLIC_BACKEND_ENDPOINT
ENV NEXT_PUBLIC_BACKEND_ENDPOINT=$NEXT_PUBLIC_BACKEND_ENDPOINT
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./next.config.mjs
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json

RUN chown -R node:node /app
USER node
EXPOSE 3000

RUN ls -lah . && ls -lah .next || true
RUN test -f .next/BUILD_ID && echo "Found BUILD_ID" || (echo "No BUILD_ID in .next" && exit 1)

CMD ["npm", "start"]


# =====================================================================
# run dev
# FROM node:18-alpine
# WORKDIR /app

# COPY package.json package-lock.json ./
# run npm install

# COPY . .
# ARG NEXT_PUBLIC_BACKEND_ENDPOINT
# ENV NEXT_PUBLIC_BACKEND_ENDPOINT=$NEXT_PUBLIC_BACKEND_ENDPOINT
# ENV NODE_ENV=development
# EXPOSE 3000
# CMD ["npm", "run", "dev"]
