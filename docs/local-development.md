# Local Development

## Install

```bash
corepack enable
pnpm install
```

## App-Only Development

Run API:

```bash
pnpm api:dev
```

Run web:

```bash
pnpm web:dev
```

Run both:

```bash
pnpm dev:local
```

The Vite dev server proxies `/api` to the local API.

## Full Docker Stack

```bash
docker compose up --build -d
./scripts/healthcheck.sh
```

Useful URLs:

| Service | URL |
| --- | --- |
| Dashboard | http://localhost:8088 |
| API health | http://localhost:8088/api/health |
| API docs | http://localhost:8088/api/docs |
| API metrics | http://localhost:8088/api/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Loki | http://localhost:3100 |
| Promtail | http://localhost:9080 |

## Scripts

```bash
./scripts/dev.sh detached
./scripts/healthcheck.sh
./scripts/logs.sh api
./scripts/restart.sh api
./scripts/clean.sh --force
```

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm run ci
```
