# Monitoring

This project uses Prometheus for local metrics collection.

## Services

| Service | URL |
| --- | --- |
| Prometheus | http://localhost:9090 |
| Prometheus targets | http://localhost:9090/targets |
| API metrics through Nginx | http://localhost:8088/api/metrics |
| API metrics direct | http://localhost:8080/metrics |

## Scrape Target

Prometheus scrapes the API container inside the Docker Compose network:

```yaml
targets:
  - api:8080
```

The API exposes Prometheus metrics at:

```text
/metrics
```

## Important Metrics

- `http_requests_total`
- `http_request_duration_seconds`
- `app_errors_total`
- `app_load_events_total`
- `app_info`
- `node_process_cpu_user_seconds_total`
- `node_process_resident_memory_bytes`

## Example PromQL Queries

```promql
up
http_requests_total
rate(http_requests_total[1m])
http_request_duration_seconds_count
app_load_events_total
app_errors_total
app_info
```

## Generate Metric Changes

Start the stack:

```bash
docker compose up --build
```

Generate CPU load:

```bash
curl -X POST http://localhost:8088/api/load/cpu \
  -H "Content-Type: application/json" \
  -d '{"durationMs":1000}'
```

Generate an intentional error:

```bash
curl -i -X POST http://localhost:8088/api/load/errors
```

Then query:

- `app_load_events_total`
- `app_errors_total`
- `rate(http_requests_total[1m])`
