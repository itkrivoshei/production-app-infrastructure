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

To be added.

## Tech Stack

To be added.

## Local Development

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

To be added.

## Logging

To be added.

## Load Testing

To be added.

## Optional AWS Infrastructure

To be added.

## Screenshots

To be added.
