# Demo Guide

This project has two demo modes:

| Mode            | Purpose                                                                        |
| --------------- | ------------------------------------------------------------------------------ |
| Online preview  | Static GitHub Pages dashboard with mock data for quick review.                 |
| Full local demo | Real Docker Compose stack with API, Prometheus, Grafana, Loki, Alloy, and k6. |

## Online Preview

Open the static dashboard preview:

https://itkrivoshei.github.io/production-app-infrastructure/

The online preview is frontend-only and uses mock data. Backend health checks, metrics, logs, load testing, and rollback workflows run in the full local demo.

Static preview actions are intentionally interactive:

- `Run Health Check` refreshes mock health, readiness, version, uptime, and metrics.
- `Generate CPU Load` simulates load and increases request/load-related metrics.
- `Generate Errors` creates controlled demo errors and updates the error count/rate.
- `Generate Logs` adds mock log entries to the Activity Console.
- Local-only services show a guidance panel with the local URL, start command, and relevant docs instead of navigating to broken static URLs.

## Full Local Demo

Start the real stack:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose --profile observability up --build -d
```

Run the health gate:

```bash
pnpm demo:health
```

Open the local services:

| Service     | URL                               |
| ----------- | --------------------------------- |
| Dashboard   | http://localhost:3000             |
| API health  | http://localhost:3000/api/health  |
| API docs    | http://localhost:3000/api/docs    |
| API metrics | http://localhost:3000/api/metrics |
| Prometheus  | http://localhost:9090             |
| Grafana     | http://localhost:3001             |
| Loki        | http://localhost:3100             |

Stop the stack:

```bash
docker compose --profile observability down
```

## Demo 1: Start The Stack

```bash
docker compose --profile observability up --build -d
docker compose ps
pnpm demo:health
```

Show:

- Dashboard opens at http://localhost:3000.
- API health returns green at http://localhost:3000/api/health.
- Prometheus target `devops-control-center-api` is `UP`.
- Grafana opens with the provisioned DevOps Control Center dashboard.

## Demo 2: Generate Load

From the dashboard, click `Generate CPU Load`.

Or run:

```bash
pnpm k6:docker:load
```

Show:

- Request counters increase on the dashboard.
- The Activity Console records the generated load with a timestamp.
- Response timing changes in Grafana.
- API logs appear through the Loki datasource in Grafana Explore.
- k6 output shows request rate and latency data.

## Demo 3: Generate Controlled Errors

From the dashboard, click `Generate Errors`.

Or run:

```bash
curl -i -X POST http://localhost:3000/api/load/errors \
  -H "X-Demo-Action: true"
```

Show:

- API returns a controlled `500` response.
- Error count and error rate increase on the dashboard.
- The Activity Console labels the event as a controlled demo error, not an application crash.
- Grafana error panels change.
- Loki contains the generated error log.

## Demo 4: Restart A Service

```bash
./scripts/restart.sh api
./scripts/healthcheck.sh
```

Show:

- API container restarts.
- Health briefly changes during restart.
- Health returns to green after the service is ready again.
- Logs show service startup after restart.

## Demo 5: Rollback Simulation

```bash
./scripts/rollback-demo.sh --dry-run
./scripts/rollback-demo.sh HEAD^
```

Show:

- `HEAD^` is selected as the real rollback source ref.
- The isolated rollback Compose project deploys the current release first.
- The API is recreated with the rollback target.
- `/version` matches the rollback version.
- Health checks pass after rollback.

Clean up the rollback demo:

```bash
./scripts/rollback-demo.sh --clean
```

## Recommended Demo Flow

For a short walkthrough, use this order:

1. Open the dashboard.
2. Show API health and API docs.
3. Show Prometheus target status.
4. Open Grafana dashboard.
5. Generate load.
6. Generate controlled errors.
7. Show logs in Grafana Explore through Loki.
8. Restart the API and run the health gate.
9. Run the rollback simulation.

## Screenshot Proof

Committed evidence:

| Proof                             | File                             |
| --------------------------------- | -------------------------------- |
| Dashboard overview                | [`docs/screenshots/dashboard.png`](screenshots/dashboard.png) |
| Dashboard action feedback         | [`docs/screenshots/activity-console.png`](screenshots/activity-console.png) |
| Static local-service guidance     | [`docs/screenshots/static-guidance.png`](screenshots/static-guidance.png) |
| Mobile dashboard                  | [`docs/screenshots/mobile-dashboard.png`](screenshots/mobile-dashboard.png) |
| Prometheus scrape target          | [`docs/screenshots/prometheus-targets.png`](screenshots/prometheus-targets.png) |
| Prometheus request rate graph     | [`docs/screenshots/prometheus-graph-requests.png`](screenshots/prometheus-graph-requests.png) |
| Dashboard Metrics page            | [`docs/screenshots/dashboard-metrics.png`](screenshots/dashboard-metrics.png) |
| Dashboard Metrics narrow layout   | [`docs/screenshots/dashboard-metrics-narrow.png`](screenshots/dashboard-metrics-narrow.png) |
| API docs (Swagger/OpenAPI)        | [`docs/screenshots/api-docs.png`](screenshots/api-docs.png) |
| Grafana dashboard after load generation | [`docs/screenshots/grafana-dashboard-load.png`](screenshots/grafana-dashboard-load.png) |
| Grafana Explore with Loki logs    | [`docs/screenshots/grafana-explore-loki-logs.png`](screenshots/grafana-explore-loki-logs.png) |
| k6 load test terminal output      | [`docs/screenshots/k6-load-terminal.png`](screenshots/k6-load-terminal.png) |
| k6 load test summary              | [`docs/screenshots/k6-load-summary.png`](screenshots/k6-load-summary.png) |
| Full stack startup                | [`docs/screenshots/docker-compose-up-full-stack.png`](screenshots/docker-compose-up-full-stack.png) |
| Demo health check terminal output | [`docs/screenshots/demo-health-terminal.png`](screenshots/demo-health-terminal.png) |
| Rollback output with real source refs and derived versions | [`docs/screenshots/rollback-demo-terminal.png`](screenshots/rollback-demo-terminal.png) |
