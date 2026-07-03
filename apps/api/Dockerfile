FROM node:20-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/ apps/api/
COPY packages/ packages/

RUN corepack enable && pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "start"]
