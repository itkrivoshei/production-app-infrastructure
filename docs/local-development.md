# Local Development

## Run Backend

```bash
pnpm api:dev
```

Backend runs on:

```text
http://localhost:8080
```

## Run Frontend

```bash
pnpm web:dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Run Both

```bash
pnpm dev:local
```

## Useful Checks

```bash
pnpm api:typecheck
pnpm api:test
pnpm web:typecheck
pnpm web:test
pnpm web:build
```

## Docker Compose

Run the full local production-like stack:

```bash
docker compose up --build
```

Services:

| Service | URL |
| --- | --- |
| Frontend through Nginx | [http://localhost:8088](http://localhost:8088) |
| API through Nginx | [http://localhost:8088/api/health](http://localhost:8088/api/health) |
| Direct API | [http://localhost:8080/health](http://localhost:8080/health) |
| Prometheus | [http://localhost:9090](http://localhost:9090) |
| Prometheus targets | [http://localhost:9090/targets](http://localhost:9090/targets) |
| Grafana | [http://localhost:3001](http://localhost:3001) |
| Grafana dashboard | [http://localhost:3001/d/devops-control-center/devops-control-center](http://localhost:3001/d/devops-control-center/devops-control-center) |

Health check:

```bash
bash scripts/healthcheck.sh
```

Logs:

```bash
bash scripts/logs.sh
bash scripts/logs.sh api
bash scripts/logs.sh web
bash scripts/logs.sh nginx
bash scripts/logs.sh prometheus
bash scripts/logs.sh grafana
```

Restart:

```bash
bash scripts/restart.sh api
```

Clean:

```bash
bash scripts/clean.sh
```

## Operational Scripts

The project includes small Bash scripts for common local operations.

### Start The Local Docker Stack

```bash
./scripts/dev.sh
```

Start in detached mode:

```bash
./scripts/dev.sh detached
```

### Run Health Checks

```bash
./scripts/healthcheck.sh
```

This checks:

- frontend through Nginx
- Nginx health endpoint
- API through Nginx
- direct API health endpoint
- Prometheus readiness
- Prometheus API scrape target
- Grafana health endpoint
- Grafana dashboard provisioning

### View Logs

All services:

```bash
./scripts/logs.sh
```

Specific service:

```bash
./scripts/logs.sh api
./scripts/logs.sh web
./scripts/logs.sh nginx
./scripts/logs.sh prometheus
./scripts/logs.sh grafana
```

### Restart A Service

```bash
./scripts/restart.sh api
```

Valid services:

- api
- web
- nginx
- prometheus
- grafana

### Clean Local Stack

Interactive:

```bash
./scripts/clean.sh
```

Non-interactive:

```bash
./scripts/clean.sh --force
```

The cleanup script only removes this project's Docker Compose stack and volumes. It does not run `docker system prune`.

## Prometheus

Prometheus runs on:

```text
http://localhost:9090
```

Targets page:

```text
http://localhost:9090/targets
```

The API target should be `UP`.

The API metrics endpoint is available through Nginx:

```text
http://localhost:8088/api/metrics
```

## Grafana

Grafana runs on:

```text
http://localhost:3001
```

The dashboard is provisioned automatically and opens at:

```text
http://localhost:3001/d/devops-control-center/devops-control-center
```

The Prometheus datasource and dashboard provider are loaded from:

```text
ops/grafana/provisioning/datasources/prometheus.yml
ops/grafana/provisioning/dashboards/dashboards.yml
```
