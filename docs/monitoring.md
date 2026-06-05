# Monitoring

## Overview

The local stack exposes application metrics from the API and scrapes them with Prometheus inside the Docker network.

Prometheus reads the API through the internal Compose service name:

```yaml
targets:
  - api:8080
```

The same metrics endpoint is also available locally for direct checks:

```text
http://localhost:3000/api/metrics
```

Grafana is provisioned with Prometheus as a metrics datasource and dashboards for the local demo environment.

## Local Endpoints

| Service            | URL                               |
| ------------------ | --------------------------------- |
| API metrics        | http://localhost:3000/api/metrics |
| Prometheus         | http://localhost:9090             |
| Prometheus targets | http://localhost:9090/targets     |
| Grafana            | http://localhost:3001             |

## Verify

Start the stack and run the health checks:

```bash
export COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml
docker compose --profile observability up --build -d
pnpm demo:health
```

Check that the API exposes metrics:

```bash
curl -fsS http://localhost:3000/api/metrics | head
```

Check that Prometheus can see the API target:

```bash
curl -fsS "http://localhost:9090/api/v1/targets?state=active" \
  | grep devops-control-center-api
```

Open the Prometheus targets page:

```text
http://localhost:9090/targets
```

The API target should be listed as `UP`.

## Important Metrics

| Metric                                | Meaning                                                 |
| ------------------------------------- | ------------------------------------------------------- |
| `http_requests_total`                 | Total number of handled HTTP requests.                  |
| `http_request_duration_seconds`       | HTTP request duration histogram.                        |
| `app_errors_total`                    | Total number of controlled demo errors.                 |
| `app_load_events_total`               | Total number of generated demo load events.             |
| `app_info`                            | Application metadata such as version/build information. |
| `node_process_cpu_user_seconds_total` | Node.js process CPU usage.                              |
| `node_process_resident_memory_bytes`  | Node.js process resident memory usage.                  |

## Useful PromQL Queries

Request rate:

```promql
rate(http_requests_total[1m])
```

Error rate:

```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

95th percentile request duration:

```promql
histogram_quantile(
  0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```

Resident memory:

```promql
node_process_resident_memory_bytes
```

Application info:

```promql
app_info
```

## Grafana

Grafana provisioning is stored in:

```text
ops/grafana/provisioning/datasources
ops/grafana/provisioning/dashboards
ops/grafana/dashboards
```

Open Grafana:

```text
http://localhost:3001
```

Provisioned dashboards should be available after the stack starts. If dashboards are missing, restart Grafana:

```bash
docker compose restart grafana
```

## Generate Demo Activity

Generate CPU load:

```bash
curl -fsS -X POST http://localhost:3000/api/load/cpu \
  -H "Content-Type: application/json" \
  -H "X-Demo-Action: true" \
  -d '{"durationMs":1000}'
```

Generate controlled errors:

```bash
curl -i -X POST http://localhost:3000/api/load/errors \
  -H "X-Demo-Action: true"
```

Generate demo logs:

```bash
curl -fsS -X POST http://localhost:3000/api/logs/generate \
  -H "Content-Type: application/json" \
  -H "X-Demo-Action: true" \
  -d '{"level":"info","message":"manual monitoring demo log"}'
```

Run k6 load tests:

```bash
pnpm k6:docker:smoke
pnpm k6:docker:load
```

## Troubleshooting

| Problem                   | Check                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| API metrics are empty     | Open http://localhost:3000/api/metrics and confirm the API is running.                              |
| Prometheus target is down | Run `docker compose ps` and check Prometheus target status at http://localhost:9090/targets.      |
| Grafana has no data       | Confirm Prometheus is scraping the API and restart Grafana with `docker compose restart grafana`. |
| Metrics do not change     | Generate activity with `/load/cpu`, `/load/errors`, or `pnpm k6:docker:load`.                     |
| Stack state looks stale   | Restart the demo stack with `pnpm demo:down && pnpm demo:up`.                                    |
