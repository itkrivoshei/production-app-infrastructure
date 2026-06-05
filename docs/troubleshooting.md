# Troubleshooting

Use this guide when the local Docker Compose stack, observability tools, load tests, or Terraform validation do not behave as expected.

## Quick Diagnostics

Start with the common checks:

```bash
docker compose config
docker compose ps
docker compose logs api
docker compose logs web
docker compose logs nginx
./scripts/healthcheck.sh
```

For a full rebuild:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose --profile observability down --remove-orphans
docker compose --profile observability up --build -d
pnpm demo:health
```

## Stack Does Not Start

Check the Compose configuration and container state:

```bash
docker compose config
docker compose ps
```

Read service logs:

```bash
docker compose logs api
docker compose logs web
docker compose logs nginx
```

Rebuild from a clean local state:

```bash
docker compose down --remove-orphans
docker compose up --build -d
./scripts/healthcheck.sh
```

If the issue still appears, rebuild images without cache:

```bash
docker compose build --no-cache api web nginx
docker compose up -d
./scripts/healthcheck.sh
```

## Port Already In Use

Check which process uses the port:

```bash
sudo lsof -i :3000
```

Override the only public application port:

```bash
NGINX_PORT=18088 docker compose up --build -d
```

Then open:

```text
http://localhost:18088
```

## API Healthcheck Fails

Check the API directly:

```bash
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/ready
curl -i http://localhost:3000/api/version
```

Check API logs:

```bash
docker compose logs api
```

Restart only the API container:

```bash
docker compose restart api
./scripts/healthcheck.sh
```

## Dashboard Does Not Load

Check the web and Nginx containers:

```bash
docker compose ps web nginx
docker compose logs web
docker compose logs nginx
```

Check the dashboard through Nginx:

```bash
curl -i http://localhost:3000
```

Check API routing through Nginx:

```bash
curl -i http://localhost:3000/api/health
```

## Prometheus Target Is Down

Check that the API exposes metrics:

```bash
curl -fsS http://localhost:3000/api/metrics | head
```

Check Prometheus targets:

```bash
curl -fsS http://localhost:9090/api/v1/targets
```

Read Prometheus logs:

```bash
docker compose logs prometheus
```

Restart Prometheus after config changes:

```bash
docker compose restart prometheus
```

## Grafana Has No Data

Check that Prometheus and Loki are running:

```bash
docker compose ps prometheus loki grafana
```

Check Grafana logs:

```bash
docker compose logs grafana
```

Open Grafana locally:

```text
http://localhost:3001
```

Then verify that datasources are provisioned and reachable.

## Loki Has No Logs Yet

Generate an API log entry:

```bash
curl -fsS -X POST http://localhost:3000/api/logs/generate \
  -H "Content-Type: application/json" \
  -H "X-Demo-Action: true" \
  -d '{"level":"info","message":"debug loki"}'
```

Query Loki directly:

```bash
curl -G -fsS http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={service="api"}' \
  --data-urlencode 'limit=5'
```

Check Alloy logs:

```bash
docker compose logs alloy
```

Restart Alloy if container discovery looks stale:

```bash
docker compose restart alloy
```

## k6 Fails To Start

Make sure the stack is healthy first:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose up --build -d
pnpm demo:health
```

Run the smoke test:

```bash
pnpm k6:docker:smoke
```

If the test cannot reach the app, check Nginx:

```bash
curl -i http://localhost:3000/api/health
docker compose logs nginx
```

## Rollback Demo Fails

Check that the stack is running and healthy:

```bash
docker compose ps
./scripts/healthcheck.sh
```

Run the rollback demo:

```bash
./scripts/rollback-demo.sh v1.0.0
```

Clean rollback demo resources:

```bash
./scripts/rollback-demo.sh --clean
```

If refs cannot be resolved, fetch them first. The script intentionally rejects
identical refs and identical resulting images.

## Terraform Is Not Initialized

Initialize the Terraform working directory:

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
```

Return to the repository root:

```bash
cd ../../..
```

## Docker Cleanup

Use this only when local containers, networks, or volumes are stuck.

Stop the project stack:

```bash
docker compose down --remove-orphans
```

Remove project containers and networks:

```bash
docker compose down --remove-orphans --volumes
```

Check remaining containers:

```bash
docker ps -a
```

Avoid global Docker cleanup unless you are sure you do not need other local containers or images.

## Before Opening an Issue

Collect the following output:

```bash
docker compose config
docker compose ps
./scripts/healthcheck.sh
docker compose logs api
docker compose logs nginx
docker compose logs prometheus
docker compose logs alloy
```
