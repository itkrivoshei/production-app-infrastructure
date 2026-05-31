# Project 2 Readiness

Project 2 can reuse this repository as the base for Kubernetes work.

## Readiness Check

```bash
./scripts/project2-readiness.sh
```

The script checks:

- required Docker, observability, k6, CI, security, rollback, and Terraform files exist;
- app source has no hardcoded `localhost` references;
- runtime Dockerfiles use non-root users;
- Docker Compose config is valid;
- the local stack starts and passes health checks;
- API, OpenAPI, metrics, Prometheus, and Loki ingestion work;
- GHCR image manifests are reachable when available;
- Terraform validates when initialized.

## Strict GHCR Mode

Default GHCR mode is `auto`, which warns when packages are not published yet. After main publishes images, run:

```bash
CHECK_GHCR=true ./scripts/project2-readiness.sh
```

Skip stack startup when it is already running:

```bash
START_STACK=false ./scripts/project2-readiness.sh
```

## Kubernetes Handoff Notes

Reuse these concepts in Project 2:

- `/api/health` as liveness probe;
- `/api/ready` as readiness probe;
- `/api/metrics` as Prometheus scrape target;
- stdout/stderr logs for cluster logging;
- `VITE_*` build-time frontend configuration;
- GHCR `latest` and `sha-*` image tags;
- Terraform as optional cloud proof, not a Kubernetes requirement.
