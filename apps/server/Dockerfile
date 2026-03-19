FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json ./package.json
COPY tsconfig.base.json ./tsconfig.base.json
COPY packages/domain/package.json ./packages/domain/package.json
COPY packages/domain/tsconfig.json ./packages/domain/tsconfig.json
COPY packages/domain/src ./packages/domain/src
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/src ./apps/server/src

RUN npm install --include=dev

WORKDIR /app/apps/server
EXPOSE 4000
CMD ["npm", "run", "start"]
