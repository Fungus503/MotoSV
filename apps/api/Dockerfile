FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --prod --frozen-lockfile --filter @motosv/api-server
EXPOSE 3000
CMD ["pnpm", "start"]
