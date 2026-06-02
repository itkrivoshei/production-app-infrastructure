# Monitoring

Prometheus scrapes the API inside the Docker network:

```yaml
targets:
  - api:8080
```

The public metrics endpoint is:

```text
http://localhost:8080/metrics
```

## Verify

```bash
docker compose up --build -d
./scripts/healthcheck.sh
curl -fsS http://localhost:8080/metrics | head
curl -fsS http://localhost:9090/api/v1/targets | grep devops-control-center-api
```

## Important Metrics

- `http_requests_total`
- `http_request_duration_seconds`
- `app_errors_total`
- `app_load_events_total`
- `app_info`
- `node_process_cpu_user_seconds_total`
- `node_process_resident_memory_bytes`

## Grafana

Grafana is provisioned from:

```text
ops/grafana/provisioning/datasources
ops/grafana/provisioning/dashboards
ops/grafana/dashboards
```

Open:

```text
http://localhost:3001
```

Generate activity:

```bash
curl -fsS -X POST http://localhost:8080/load/cpu \
  -H "Content-Type: application/json" \
  -d '{"durationMs":1000}'

curl -i -X POST http://localhost:8080/load/errors
```
