<div align="center">

# Production App Infrastructure

Production-like DevOps Control Center for a small API and dashboard with Docker, observability, CI/CD, security scans, rollback, and Terraform validation.

[![Live demo](https://img.shields.io/badge/live-GitHub%20Pages-2ea44f?style=for-the-badge&logo=githubpages&logoColor=white)](https://itkrivoshei.github.io/production-app-infrastructure/)
[![CI](https://img.shields.io/github/actions/workflow/status/itkrivoshei/production-app-infrastructure/ci.yml?branch=main&style=for-the-badge&label=ci&logo=githubactions&logoColor=white)](https://github.com/itkrivoshei/production-app-infrastructure/actions/workflows/ci.yml)
[![Docker Images](https://img.shields.io/github/actions/workflow/status/itkrivoshei/production-app-infrastructure/docker.yml?branch=main&style=for-the-badge&label=docker%20images&logo=docker&logoColor=white)](https://github.com/itkrivoshei/production-app-infrastructure/actions/workflows/docker.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/itkrivoshei/production-app-infrastructure/security.yml?branch=main&style=for-the-badge&label=security&logo=trivy&logoColor=white)](https://github.com/itkrivoshei/production-app-infrastructure/actions/workflows/security.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/itkrivoshei/production-app-infrastructure/codeql.yml?branch=main&style=for-the-badge&label=codeql&logo=github&logoColor=white)](https://github.com/itkrivoshei/production-app-infrastructure/actions/workflows/codeql.yml)
[![Pages](https://img.shields.io/github/actions/workflow/status/itkrivoshei/production-app-infrastructure/pages.yml?branch=main&style=for-the-badge&label=pages&logo=githubpages&logoColor=white)](https://github.com/itkrivoshei/production-app-infrastructure/actions/workflows/pages.yml)
[![License](https://img.shields.io/github/license/itkrivoshei/production-app-infrastructure?style=for-the-badge)](LICENSE)

</div>

## What It Demonstrates

- Fastify API with health, readiness, version, OpenAPI, metrics, demo load, and demo logs.
- React/Vite dashboard served through Nginx.
- Docker Compose stack with API, web, Nginx, Prometheus, Grafana, Loki, Promtail, and k6.
- Prometheus metrics and provisioned Grafana dashboards.
- Structured API logs collected by Promtail and queried in Loki.
- k6 smoke, load, and stress tests.
- GitHub Actions for CI, GHCR image publishing, CodeQL, Trivy, Hadolint, and ShellCheck.
- Rollback demo using local image tags and an isolated Compose project.
- Optional AWS Terraform layer that validates locally without creating resources.
- Project 2 readiness checks for Kubernetes handoff.

## Quick Start

```bash
corepack enable
pnpm install
docker compose up --build -d
./scripts/healthcheck.sh
```

Open the local demo:

| Service | URL |
| --- | --- |
| Dashboard | http://localhost:3000 |
| API | http://localhost:8080 |
| API health | http://localhost:8080/health |
| API docs | http://localhost:8080/docs |
| API metrics | http://localhost:8080/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Loki | http://localhost:3100 |
| Promtail | http://localhost:9080 |

Stop the stack:

```bash
docker compose down
```

## Demo

### Quick Online Preview

The online demo shows the DevOps Control Center interface with mock data:

https://itkrivoshei.github.io/production-app-infrastructure/

This online demo is a static UI preview. The full observability stack runs locally with Docker Compose.

### Full Local Demo

Run the real stack locally:

```bash
docker compose up --build
```

Services:

| Service | URL |
| --- | --- |
| Dashboard | http://localhost:3000 |
| API | http://localhost:8080 |
| API Docs | http://localhost:8080/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |
| Loki | http://localhost:3100 |

The dashboard port can still be overridden, for example `NGINX_PORT=8088 docker compose up --build`.

Demo scenarios:

```bash
pnpm demo:health
pnpm k6:docker:load
curl -i -X POST http://localhost:8080/load/errors
./scripts/restart.sh api
./scripts/rollback-demo.sh v1.0.0
./scripts/rollback-demo.sh --clean
```

The dashboard can also generate CPU load, controlled errors, and logs from the UI. See [Demo guide](docs/demo.md) for the step-by-step walkthrough.

## Local Quality Gate

```bash
pnpm run ci
docker compose config
docker compose up --build -d
./scripts/healthcheck.sh
./scripts/project2-readiness.sh
pnpm k6:docker:smoke
pnpm k6:docker:load
./scripts/rollback-demo.sh v1.0.0
./scripts/rollback-demo.sh --clean
```

Terraform validation:

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
cd ../../..
```

## Common Commands

```bash
pnpm dev:local
pnpm docker:dev
pnpm docker:down
pnpm demo:up
pnpm demo:down
pnpm demo:health
pnpm demo:load
pnpm demo:rollback
pnpm health
pnpm logs
pnpm k6:docker:smoke
pnpm k6:docker:load
pnpm tf:aws:fmt
pnpm tf:aws:validate
```

Direct API checks:

```bash
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8080/ready
curl -fsS http://localhost:8080/version
curl -fsS http://localhost:8080/metrics | head
```

Generate traffic and logs:

```bash
curl -fsS -X POST http://localhost:8080/load/cpu \
  -H "Content-Type: application/json" \
  -d '{"durationMs":500}'

curl -fsS -X POST http://localhost:8080/logs/generate \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"manual demo log"}'
```

## Documentation

- [Architecture](docs/architecture.md)
- [Demo guide](docs/demo.md)
- [Local development](docs/local-development.md)
- [Monitoring](docs/monitoring.md)
- [Logging](docs/logging.md)
- [Load testing](docs/load-testing.md)
- [CI/CD](docs/ci-cd.md)
- [Security](docs/security.md)
- [Rollback](docs/rollback.md)
- [Terraform AWS](docs/terraform-aws.md)
- [Project 2 readiness](docs/project-2-readiness.md)
- [Troubleshooting](docs/troubleshooting.md)

## Project 2 Handoff

Run this before starting Kubernetes work:

```bash
./scripts/project2-readiness.sh
```

For strict GHCR validation after the main-branch Docker workflow publishes images:

```bash
CHECK_GHCR=true ./scripts/project2-readiness.sh
```
