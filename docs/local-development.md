# Local Development

## Requirements

- Node.js and pnpm through Corepack
- Docker and Docker Compose
- Bash-compatible shell

Enable Corepack and install dependencies:

```bash
corepack enable
pnpm install
```

## App-Only Development

Use this mode when working on the API or dashboard without the full observability stack.

Run the API:

```bash
pnpm api:dev
```

Run the web app:

```bash
pnpm web:dev
```

Run API and web together:

```bash
pnpm dev:local
```

The Vite development server proxies `/api` requests to the local API service.

## Full Docker Stack

Use this mode when validating the full local environment with Nginx, API, dashboard, Prometheus, Grafana, Loki, Promtail, and k6 support.

Start the stack:

```bash
docker compose up --build -d
./scripts/healthcheck.sh
```

Stop the stack:

```bash
docker compose down
```

Rebuild from a clean state:

```bash
docker compose down --remove-orphans
docker compose up --build -d
./scripts/healthcheck.sh
```

## Local URLs

| Service       | URL                           |
| ------------- | ----------------------------- |
| Dashboard     | http://localhost:3000         |
| API           | http://localhost:8080         |
| API health    | http://localhost:8080/health  |
| API readiness | http://localhost:8080/ready   |
| API version   | http://localhost:8080/version |
| API docs      | http://localhost:8080/docs    |
| API metrics   | http://localhost:8080/metrics |
| Prometheus    | http://localhost:9090         |
| Grafana       | http://localhost:3001         |
| Loki          | http://localhost:3100         |
| Promtail      | http://localhost:9080         |

## Development Scripts

| Command                      | Purpose                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `./scripts/dev.sh detached`  | Start the local Docker stack in detached mode.                 |
| `./scripts/healthcheck.sh`   | Validate API, dashboard, and local service health.             |
| `./scripts/logs.sh api`      | Show logs for the API service.                                 |
| `./scripts/restart.sh api`   | Restart the API service.                                       |
| `./scripts/clean.sh --force` | Remove local containers, volumes, and generated runtime state. |
| `pnpm docs:links`            | Validate relative Markdown documentation links.                |
| `pnpm readiness`             | Run Kubernetes readiness checks.                               |

## Common Docker Commands

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f nginx
docker compose restart api
docker compose down
```

Validate the Compose configuration:

```bash
docker compose config --quiet
```

## Quality Checks

Run individual checks during development:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm docs:links
pnpm build
```

Run the full local CI gate:

```bash
pnpm run ci
```

## Runtime Smoke Check

After starting the Docker stack, run:

```bash
./scripts/healthcheck.sh
pnpm k6:docker:smoke
```

For a stronger local validation path:

```bash
pnpm run ci
docker compose config --quiet
docker compose up --build -d
./scripts/healthcheck.sh
pnpm k6:docker:smoke
docker compose down
```

## Troubleshooting

| Symptom                    | Check                                                                  |
| -------------------------- | ---------------------------------------------------------------------- |
| Port already in use        | Stop old containers with `docker compose down --remove-orphans`.       |
| API is not reachable       | Check `docker compose logs -f api` and run `./scripts/healthcheck.sh`. |
| Dashboard cannot reach API | Confirm Nginx is running and the web app uses relative `/api` paths.   |
| Metrics are missing        | Open http://localhost:8080/metrics and check Prometheus targets.       |
| Grafana has no data        | Confirm Prometheus and Loki containers are healthy.                    |
| Logs are missing in Loki   | Check Promtail logs with `docker compose logs -f promtail`.            |
