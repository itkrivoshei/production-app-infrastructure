# Troubleshooting

## Stack Does Not Start

```bash
docker compose config
docker compose ps
docker compose logs api
docker compose logs web
docker compose logs nginx
```

Rebuild from scratch:

```bash
docker compose down --remove-orphans
docker compose up --build -d
./scripts/healthcheck.sh
```

## Port Already In Use

Override ports with environment variables:

```bash
NGINX_PORT=18088 API_PORT=18080 docker compose up --build -d
```

## Prometheus Target Is Down

```bash
curl -fsS http://localhost:8080/metrics | head
curl -fsS http://localhost:9090/api/v1/targets
docker compose logs prometheus
```

## Loki Has No Logs Yet

Generate one:

```bash
curl -fsS -X POST http://localhost:8080/logs/generate \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"debug loki"}'
```

Query:

```bash
curl -G -fsS http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={service="api"}' \
  --data-urlencode 'limit=5'
```

## k6 Fails To Start

Make sure the stack is healthy first:

```bash
docker compose up --build -d
./scripts/healthcheck.sh
pnpm k6:docker:smoke
```

## Terraform Is Not Initialized

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
```
