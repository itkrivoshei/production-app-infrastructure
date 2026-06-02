# Logging

The API writes structured Pino logs to stdout. Docker stores them with the `json-file` driver, Promtail discovers the containers, and Loki stores queryable log streams.

## Components

| Component | Config |
| --- | --- |
| Loki | `ops/loki/loki-config.yml` |
| Promtail | `ops/promtail/promtail-config.yml` |
| Grafana datasource | `ops/grafana/provisioning/datasources/loki.yml` |
| Grafana logs dashboard | `ops/grafana/dashboards/devops-logs.json` |

## Verify

```bash
docker compose up --build -d
./scripts/healthcheck.sh

curl -fsS -X POST http://localhost:8080/logs/generate \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"manual loki check"}'

curl -G -fsS http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={service="api"}' \
  --data-urlencode 'limit=5'
```

## Useful Queries

```logql
{service="api"}
{service="api", level="50"}
{service="api"} |= "manual loki check"
rate({service="api"}[1m])
```

Open Grafana:

```text
http://localhost:3001
```
