# Production App Infrastructure

Production-like DevOps Control Center for a small API and dashboard. The project is built to prove the full path from local development to Dockerized operations, observability, load testing, CI/CD, security scans, rollback, optional Terraform, and Project 2 Kubernetes reuse.

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

Open the app:

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

Stop the stack:

```bash
docker compose down
```

## Local Quality Gate

```bash
pnpm run ci
docker compose config
docker compose up --build -d
./scripts/healthcheck.sh
./scripts/project2-readiness.sh
pnpm k6:docker:smoke
pnpm k6:docker:load
./scripts/rollback-demo.sh
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
pnpm health
pnpm logs
pnpm k6:docker:smoke
pnpm k6:docker:load
pnpm tf:aws:fmt
pnpm tf:aws:validate
```

Direct API checks:

```bash
curl -fsS http://localhost:8088/api/health
curl -fsS http://localhost:8088/api/ready
curl -fsS http://localhost:8088/api/version
curl -fsS http://localhost:8088/api/metrics | head
```

Generate traffic and logs:

```bash
curl -fsS -X POST http://localhost:8088/api/load/cpu \
  -H "Content-Type: application/json" \
  -d '{"durationMs":500}'

curl -fsS -X POST http://localhost:8088/api/logs/generate \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"manual demo log"}'
```

## Documentation

- [Architecture](docs/architecture.md)
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
