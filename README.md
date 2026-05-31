# Production App Infrastructure

Production-like DevOps Control Center with Docker, GitHub Actions, Terraform, Prometheus, Grafana, Loki, k6, Trivy, and AWS-ready infrastructure.

## What this project demonstrates

- Containerized frontend and backend services
- Local production-like Docker Compose environment
- Reverse proxy with Nginx
- Metrics with Prometheus
- Dashboards with Grafana
- Logs with Loki and Promtail
- Load testing with k6
- CI/CD with GitHub Actions
- Docker image publishing to GHCR
- Security scanning with Trivy, Hadolint, and ShellCheck
- Optional AWS infrastructure with Terraform

## Architecture

```text
React dashboard -> Nginx reverse proxy -> Fastify API -> Prometheus metrics
                                      └-> Grafana dashboards
```

The local stack is intentionally production-like: services are isolated in Docker
Compose, Nginx owns the public entrypoint, the API exposes readiness and metrics,
and observability services run beside the application.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Fastify, TypeScript, Prometheus client |
| Runtime | Docker, Docker Compose, Nginx |
| Observability | Prometheus, Grafana, Loki, Promtail |
| Delivery | GitHub Actions, GHCR-ready Docker images |
| Infrastructure | Terraform AWS skeleton and deployment notes |

## Local Development

Install dependencies:

```bash
corepack enable
pnpm install
```

Run the backend:

```bash
pnpm api:dev
```

Run the frontend dashboard:

```bash
pnpm web:dev
```

Open:

```text
http://localhost:5173
```

Run both locally:

```bash
pnpm dev:local
```

Run the full local verification suite:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose config --quiet
docker compose build api web
```

## Frontend Dashboard

The frontend dashboard is built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Recharts, and React Router.

It shows:

- API health
- readiness status
- service version
- environment
- uptime
- metrics endpoint status
- demo load, error, and log actions

## Dockerized Local Environment

The project can run as a production-like local stack with Docker Compose.

```bash
docker compose up --build
```

The stack includes:

- Fastify API container
- React static frontend container
- Nginx reverse proxy
- Prometheus metrics scraper
- Grafana dashboard service
- Docker health checks
- Isolated Docker network
- Restart policies

Open:

```text
http://localhost:8088
```

API through Nginx:

```text
http://localhost:8088/api/health
```

Prometheus:

```text
http://localhost:9090
```

Grafana:

```text
http://localhost:3001
```

## Operational Scripts

```bash
./scripts/dev.sh detached
./scripts/healthcheck.sh
./scripts/logs.sh api
./scripts/restart.sh api
./scripts/clean.sh --force
```

These scripts provide a small operational layer for local Docker-based development and troubleshooting.

## CI/CD

To be added.

## Monitoring

The local Docker Compose stack includes Prometheus for metrics collection.

Prometheus scrapes the Fastify API at:

```text
api:8080/metrics
```

Useful URLs:

| Service | URL |
| --- | --- |
| Prometheus | http://localhost:9090 |
| Targets | http://localhost:9090/targets |
| API metrics | http://localhost:8088/api/metrics |

Example metrics:

- `http_requests_total`
- `http_request_duration_seconds`
- `app_errors_total`
- `app_load_events_total`
- `app_info`

See [docs/monitoring.md](docs/monitoring.md).

## Grafana Dashboard

The stack includes a pre-provisioned Grafana dashboard.

| Service | URL |
| --- | --- |
| Grafana | http://localhost:3001 |
| Dashboard | http://localhost:3001/d/devops-control-center/devops-control-center |
| Prometheus | http://localhost:9090 |

The dashboard is stored as code in:

```text
ops/grafana/dashboards/devops-control-center.json
```

It visualizes:

- requests per minute
- error rate
- response time p95
- API uptime
- CPU usage
- memory usage
- load events

## Logging

To be added.

## Load Testing

To be added.

## Optional AWS Infrastructure

To be added.

## Screenshots

To be added.
