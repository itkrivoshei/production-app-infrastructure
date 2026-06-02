# Architecture

## Local Stack

```text
Browser
  -> Nginx edge :3000
    -> web static container :8080
    -> API container :8080
      -> /metrics for Prometheus
      -> stdout JSON logs for Promtail

Prometheus -> API /metrics
Grafana -> Prometheus + Loki datasources
Promtail -> Docker logs -> Loki
k6 -> Nginx edge
```

## Services

| Service | Purpose |
| --- | --- |
| `api` | Fastify API with health, readiness, OpenAPI, metrics, demo load, and demo logs. |
| `web` | React dashboard built by Vite and served by unprivileged Nginx. |
| `nginx` | Public local entrypoint and reverse proxy. |
| `prometheus` | Scrapes API metrics. |
| `grafana` | Provisioned dashboards and datasources. |
| `loki` | Stores local log streams. |
| `promtail` | Discovers Docker containers and ships logs to Loki. |
| `k6` | Optional Compose profile for smoke/load/stress testing. |

## Runtime Decisions

- API and web images use multi-stage Docker builds.
- Runtime containers use non-root users where practical.
- Application config is environment-based; frontend source defaults to relative paths.
- Logs go to stdout/stderr so Docker, Promtail, and future Kubernetes logging can collect them.
- Compose healthchecks mirror the endpoints Kubernetes probes can reuse later.

## Main Paths

| Path | Meaning |
| --- | --- |
| `/` | Dashboard |
| `/api/health` | Liveness |
| `/api/ready` | Readiness |
| `/api/version` | Version and commit metadata |
| `/api/metrics` | Prometheus metrics |
| `/api/docs` | Swagger UI |
| `/api/logs/generate` | Demo structured log generator |
