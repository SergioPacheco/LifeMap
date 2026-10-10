# ============================================================
# LifeMap report services (API + worker)
# Node 22 (bookworm-slim, glibc — matches sweph prebuilds).
# Chromium ships now so task 5 (editorial PDF) needs no image change.
# ============================================================

FROM node:22-bookworm AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run services:build

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Chromium + OS deps (cached in the image for task 5 PDF rendering).
RUN npx --yes playwright@1.64.0 install --with-deps chromium

COPY --from=builder /app/dist ./dist

EXPOSE 4100
CMD ["node", "dist/services/report-api/main.js"]
