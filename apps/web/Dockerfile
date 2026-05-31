# syntax=docker/dockerfile:1.7

FROM node:22-alpine3.23 AS build

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG VITE_API_URL=/api
ARG VITE_GRAFANA_URL=http://localhost:3001
ARG VITE_PROMETHEUS_URL=http://localhost:9090
ARG VITE_API_DOCS_URL=/api/docs

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GRAFANA_URL=$VITE_GRAFANA_URL
ENV VITE_PROMETHEUS_URL=$VITE_PROMETHEUS_URL
ENV VITE_API_DOCS_URL=$VITE_API_DOCS_URL

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile --filter @production-app-infrastructure/web...

COPY apps/web apps/web

RUN pnpm --filter @production-app-infrastructure/web build

FROM nginxinc/nginx-unprivileged:1.29-alpine3.23 AS runtime

USER root
RUN apk add --no-cache "libxml2=2.13.9-r1"

COPY ops/nginx/web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
