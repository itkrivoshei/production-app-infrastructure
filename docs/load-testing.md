# Load Testing

k6 scripts live in `load/`.

| Script | Purpose |
| --- | --- |
| `smoke-test.js` | One-iteration health and metrics proof. |
| `load-test.js` | Short steady traffic with reads, logs, CPU load, and intentional errors. |
| `stress-test.js` | Higher traffic ramp for manual experiments. |

## Run With Docker

```bash
docker compose up --build -d
pnpm k6:docker:smoke
pnpm k6:docker:load
```

Stress test:

```bash
pnpm k6:docker:stress
```

## Run With Local k6

```bash
TARGET_BASE_URL=http://localhost:8088 pnpm k6:smoke
TARGET_BASE_URL=http://localhost:8088 pnpm k6:load
```

## Verify Effects

```bash
curl -fsS http://localhost:8088/api/metrics | grep app_load_events_total
curl -G -fsS http://localhost:3100/loki/api/v1/query_range \
  --data-urlencode 'query={service="api"} |= "k6"' \
  --data-urlencode 'limit=5'
```
