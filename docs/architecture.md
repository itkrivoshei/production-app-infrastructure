# Architecture

## Overview

This project runs a small production-style local stack behind an Nginx edge container.

Nginx is the public local entrypoint. It serves the dashboard and proxies API traffic, while Prometheus, Grafana, Loki, Alloy, and k6 provide local observability and reliability testing.

## Local Stack

```mermaid
flowchart LR
  Browser["Browser"] --> Nginx["Nginx edge :3000"]

  Nginx --> Web["web container :8080"]
  Nginx --> API["api container :8080"]

  API --> Metrics["/metrics"]
  API --> Logs["stdout/stderr JSON logs"]

  Prometheus["Prometheus :9090"] --> Metrics
  Logs --> Alloy["Alloy :12345"]
  Alloy --> Loki["Loki :3100"]

  Grafana["Grafana :3001"] --> Prometheus
  Grafana --> Loki

  K6["k6 tests"] --> Nginx
```

## Request Flow

| Flow                       | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| Browser -> Nginx -> web    | Serves the React/Vite dashboard through the local Nginx edge.           |
| Browser -> Nginx -> API    | Proxies `/api/*` requests to the Fastify API container.                 |
| Prometheus -> API          | Scrapes application metrics from the API metrics endpoint.              |
| API -> stdout/stderr       | Emits structured JSON logs for container log collection.                |
| Alloy -> Loki              | Discovers Docker containers and ships logs to Loki.                     |
| Grafana -> Prometheus/Loki | Reads metrics and logs through provisioned datasources.                 |
| k6 -> Nginx                | Runs smoke, load, and stress tests against the public local entrypoint. |

## Services

| Service      | Purpose                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| `api`        | Fastify API with health, readiness, OpenAPI, metrics, and demo-only action endpoints.    |
| `web`        | React dashboard built by Vite and served by unprivileged Nginx.                          |
| `nginx`      | Public local entrypoint and reverse proxy for dashboard and API traffic.                 |
| `prometheus` | Scrapes API metrics and stores local time-series data.                                   |
| `grafana`    | Provides provisioned dashboards and datasources for metrics and logs.                    |
| `loki`       | Stores local log streams collected from Docker containers.                               |
| `alloy`      | Discovers Docker containers and ships structured logs to Loki.                           |
| `k6`         | Optional Compose profile for smoke, load, and stress testing.                            |

## Runtime Decisions

- API and web images use multi-stage Docker builds.
- Runtime containers use non-root users where practical.
- Nginx is the only public local entrypoint for browser traffic.
- The default stack runs `APP_MODE=safe`; demo routes exist only with [`docker-compose.demo.yml`](../docker-compose.demo.yml).
- Application containers use read-only filesystems, dropped capabilities, and `no-new-privileges`.
- Frontend API calls use relative paths so the same build works behind Nginx.
- Application configuration is environment-based.
- Logs go to `stdout` and `stderr` so Docker, Alloy, and future Kubernetes logging can collect them.
- Compose healthchecks mirror endpoints that Kubernetes probes can reuse later.
- Observability is local-first and runs through Docker Compose without external services.

## Routing Model

| Route      | Target                                        |
| ---------- | --------------------------------------------- |
| `/`        | Dashboard served through Nginx                |
| `/api/*`   | API traffic proxied through Nginx             |
| `/api/metrics` | API metrics exposed through the edge and scraped internally |
| `/api/docs`    | API documentation exposed through the edge                  |

For local service URLs and commands, see the root [README](../README.md).

## Kubernetes Handoff

The local stack is designed so core runtime concepts can map cleanly to a future Kubernetes setup.

| Local Compose Concept    | Kubernetes Equivalent                |
| ------------------------ | ------------------------------------ |
| Compose healthchecks     | Liveness and readiness probes        |
| Environment variables    | ConfigMaps and Secrets               |
| Nginx edge               | Ingress or gateway layer             |
| Docker logs              | Cluster log collection               |
| Prometheus scrape target | ServiceMonitor or scrape config      |
| Container images         | Registry-published deployment images |
| Rollback refs and images | Deployment image rollback             |
