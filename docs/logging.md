# Logging

The API writes structured Pino logs to `stdout` and `stderr`.

Docker collects container logs, Alloy discovers running containers, and Loki stores queryable log streams. Grafana uses Loki as a datasource for log exploration and dashboards.

## Flow

```text
API container
  -> stdout/stderr JSON logs
  -> Docker container logs
  -> Alloy
  -> Loki
  -> Grafana
```

## Components

| Component              | Purpose                                            | Config                                                                                              |
| ---------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Loki                   | Stores local log streams                           | [`ops/loki/loki-config.yml`](../ops/loki/loki-config.yml)                                           |
| Alloy                  | Discovers Docker containers and ships logs to Loki | [`ops/alloy/config.alloy`](../ops/alloy/config.alloy)                                                |
| Grafana datasource     | Connects Grafana to Loki                           | [`ops/grafana/provisioning/datasources/loki.yml`](../ops/grafana/provisioning/datasources/loki.yml) |
| Grafana logs dashboard | Provides a ready-to-use logs dashboard             | [`ops/grafana/dashboards/devops-logs.json`](../ops/grafana/dashboards/devops-logs.json)             |

## Verify Logging

Start the stack:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose --profile observability up --build -d
pnpm demo:health
```

Generate a manual API log:

```bash
curl -fsS -X POST http://localhost:3000/api/logs/generate \
  -H "Content-Type: application/json" \
  -H "X-Demo-Action: true" \
  -d '{"level":"info","message":"manual loki check"}'
```

Query Loki directly:

```bash
curl -G -fsS http://localhost:3100/loki/api/v1/query \
  --data-urlencode 'query={service="api"} |= "manual loki check"'
```

Query recent API logs:

```bash
curl -G -fsS http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={service="api"}' \
  --data-urlencode 'limit=20'
```

## Useful LogQL Queries

Show all API logs:

```logql
{service="api"}
```

Find the manual verification log:

```logql
{service="api"} |= "manual loki check"
```

Show info-level API logs:

```logql
{service="api", level="30"}
```

Show warning-level API logs:

```logql
{service="api", level="40"}
```

Show error-level API logs:

```logql
{service="api", level="50"}
```

Filter request logs:

```logql
{service="api"} |= "request"
```

Show API log rate over one minute:

```logql
rate({service="api"}[1m])
```

Pino uses numeric log levels. Common levels are:

| Level | Meaning |
| ----- | ------- |
| `30`  | info    |
| `40`  | warn    |
| `50`  | error   |

## Grafana

Open Grafana:

http://localhost:3001

Use the provisioned Loki datasource to explore logs:

```text
Explore -> Loki -> {service="api"}
```

The logs dashboard is provisioned from:

[`ops/grafana/dashboards/devops-logs.json`](../ops/grafana/dashboards/devops-logs.json)

## Troubleshooting

Check whether the API writes logs:

```bash
docker compose logs api --tail=50
```

Check whether Alloy is running:

```bash
docker compose ps alloy
docker compose logs alloy --tail=50
```

Check whether Loki is reachable:

```bash
curl -fsS http://localhost:3100/ready
```

Check available Loki labels:

```bash
curl -fsS http://localhost:3100/loki/api/v1/labels
```

Check service label values:

```bash
curl -fsS http://localhost:3100/loki/api/v1/label/service/values
```

If `{service="api"}` returns no logs, verify:

- the stack is running;
- the API container produced logs;
- Alloy can read Docker container logs;
- Loki is reachable from Alloy;
- the `service` label is configured as expected in Alloy.
