# Load Testing

k6 scripts live in [`load/`](../load).

The load tests exercise the public local entrypoint through Nginx, so the test path is close to how users interact with the stack locally.

## Test Profiles

| Script                                     | Purpose                                                                  | When to use                                    |
| ------------------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------- |
| [`smoke-test.js`](../load/smoke-test.js)   | One-iteration health and metrics proof.                                  | Quick validation after startup or before a PR. |
| [`load-test.js`](../load/load-test.js)     | Short steady traffic with reads, logs, CPU load, and intentional errors. | Main local reliability check.                  |
| [`stress-test.js`](../load/stress-test.js) | Higher traffic ramp for manual experiments.                              | Manual testing only, not the default PR path.  |

## Recommended: Docker

Start the stack and run the smoke/load tests through Docker:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose --profile observability up --build -d
pnpm k6:docker:smoke
pnpm k6:docker:load
```

Run the stress test manually when needed:

```bash
pnpm k6:docker:stress
```

Stop the stack after testing:

```bash
docker compose --profile observability down
```

## Local k6

If k6 is installed locally, target the Nginx edge on port `3000`:

```bash
TARGET_BASE_URL=http://localhost:3000 pnpm k6:smoke
TARGET_BASE_URL=http://localhost:3000 pnpm k6:load
TARGET_BASE_URL=http://localhost:3000 pnpm k6:stress
```

## Verify Effects

Check that load-test events are visible in API metrics:

```bash
curl -fsS http://localhost:3000/api/metrics | grep app_load_events_total
```

Check that generated API logs reached Loki:

```bash
curl -G -fsS http://localhost:3100/loki/api/v1/query \
  --data-urlencode 'query={service="api"} |= "k6"' \
  --data-urlencode 'limit=5'
```

Useful local observability URLs:

| Service     | URL                               |
| ----------- | --------------------------------- |
| Dashboard   | http://localhost:3000             |
| API metrics | http://localhost:3000/api/metrics |
| Prometheus  | http://localhost:9090             |
| Grafana     | http://localhost:3001             |
| Loki        | http://localhost:3100             |

## PR Expectations

For normal pull requests, run:

```bash
pnpm integration:compose
```

For runtime-sensitive changes, also run:

```bash
RUN_BROWSER_E2E=true pnpm integration:compose
pnpm k6:docker:load
```

Use `stress-test.js` only for manual experiments. It is intentionally not part of the default quality gate.
