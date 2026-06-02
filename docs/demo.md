# Demo Guide

This project has two demo modes:

- Online UI preview: static GitHub Pages dashboard with mock data.
- Full local demo: real Docker Compose stack with API, Prometheus, Grafana, Loki, Promtail, and k6.

## Quick Online Preview

https://itkrivoshei.github.io/production-app-infrastructure/

The online preview is frontend-only and uses mock data. It is designed for quick portfolio review. The live backend, metrics, logs, and load tests run in the full local demo.

## Full Local Demo

Start the real stack:

```bash
docker compose up --build
```

Open:

| Service | URL |
| --- | --- |
| Dashboard | http://localhost:3000 |
| API | http://localhost:8080 |
| API docs | http://localhost:8080/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Loki | http://localhost:3100 |

Run the health gate:

```bash
./scripts/healthcheck.sh
```

## Demo 1: Start The Stack

```bash
docker compose up --build -d
docker compose ps
./scripts/healthcheck.sh
```

Show:

- Dashboard opens at http://localhost:3000.
- API health is green at http://localhost:8080/health.
- Prometheus target `devops-control-center-api` is `UP`.
- Grafana opens with the provisioned DevOps Control Center dashboard.

## Demo 2: Generate Load

From the dashboard, click `Generate CPU Load`.

Or run:

```bash
pnpm k6:docker:load
```

Show:

- Request counters grow on the dashboard.
- Response timing changes in Grafana.
- API logs appear through the Loki data source in Grafana Explore.

## Demo 3: Generate Errors

From the dashboard, click `Generate Errors`.

Or run:

```bash
curl -i -X POST http://localhost:8080/load/errors
```

Show:

- API returns a controlled `500` response.
- Error count and error rate increase on the dashboard.
- Grafana error panels change.
- Loki contains the generated error log.

## Demo 4: Restart Service

```bash
./scripts/restart.sh api
./scripts/healthcheck.sh
```

Show:

- API container restarts.
- Health briefly changes during restart.
- Health returns to green.
- Logs show service startup after restart.

## Demo 5: Rollback Simulation

```bash
./scripts/rollback-demo.sh v1.0.0
./scripts/rollback-demo.sh --clean
```

Show:

- Previous version `v1.0.0` is selected as the rollback target.
- The isolated rollback Compose project deploys the current release first.
- The API is recreated with the rollback target.
- `/version` matches the rollback version.
- Health checks pass after rollback.

## Screenshot Proof

Recommended files:

| Proof | File |
| --- | --- |
| Dashboard overview | `docs/screenshots/dashboard.png` |
| Grafana dashboard | `docs/screenshots/grafana.png` |
| Loki logs through Grafana Explore | `docs/screenshots/loki-logs.png` |
| k6 load evidence | `docs/screenshots/k6-load.png` |
| Rollback evidence | `docs/screenshots/rollback.png` |

Capture instructions are in [docs/screenshots/README.md](screenshots/README.md).
