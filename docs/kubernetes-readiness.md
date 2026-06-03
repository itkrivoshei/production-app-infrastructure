# Kubernetes Readiness

This document describes the readiness checks used to validate this repository as a base for the next Kubernetes-focused project.

The goal is to make sure the current Docker Compose stack, CI/CD workflows, observability setup, image publishing, rollback workflow, and Terraform validation are stable before reusing the project as a Kubernetes handoff base.

## Readiness Check

Run from the repository root:

```bash
./scripts/kubernetes-readiness.sh
```

The script validates that the project is ready for Kubernetes-oriented work by checking:

- required Docker, observability, k6, CI, security, rollback, and Terraform files exist;
- application source does not depend on hardcoded `localhost` references;
- runtime Dockerfiles use non-root users where practical;
- Docker Compose configuration is valid;
- the local stack can start and pass health checks;
- API health, readiness, OpenAPI, metrics, Prometheus, and Loki ingestion work;
- GHCR image manifests are reachable when published;
- Terraform validates when initialized.

## Check Modes

| Mode               | Command                                                               | Purpose                                                    |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Default            | `./scripts/kubernetes-readiness.sh`                                   | Runs the standard readiness check.                         |
| Strict GHCR        | `CHECK_GHCR=true ./scripts/kubernetes-readiness.sh`                   | Requires published GHCR images to be reachable.            |
| Skip stack startup | `START_STACK=false ./scripts/kubernetes-readiness.sh`                 | Reuses an already running local stack.                     |
| Combined           | `CHECK_GHCR=true START_STACK=false ./scripts/kubernetes-readiness.sh` | Runs strict image validation without restarting the stack. |

## GHCR Validation

By default, GHCR validation runs in `auto` mode. This means unpublished packages are reported as warnings instead of hard failures.

After the `main` branch Docker workflow publishes images, run strict mode:

```bash
CHECK_GHCR=true ./scripts/kubernetes-readiness.sh
```

Expected image tags:

```text
ghcr.io/itkrivoshei/devops-control-center-api:latest
ghcr.io/itkrivoshei/devops-control-center-api:sha-<short-sha>
ghcr.io/itkrivoshei/devops-control-center-web:latest
ghcr.io/itkrivoshei/devops-control-center-web:sha-<short-sha>
```

## Kubernetes Handoff Notes

Kubernetes can reuse these concepts directly:

| Current Project                | Kubernetes Direction                             |
| ------------------------------ | ------------------------------------------------ |
| `/api/health`                  | Liveness probe                                   |
| `/api/ready`                   | Readiness probe                                  |
| `/api/metrics`                 | Prometheus scrape target                         |
| Docker Compose services        | Kubernetes Deployments and Services              |
| Environment-based config       | ConfigMaps and Secrets                           |
| stdout/stderr JSON logs        | Cluster log collection                           |
| GHCR `latest` and `sha-*` tags | Deployment image references and rollback targets |
| Nginx edge container           | Ingress or gateway layer                         |
| Prometheus/Grafana/Loki stack  | Kubernetes observability layer                   |
| Terraform validation           | Optional cloud infrastructure proof              |

## Readiness Criteria

The project is ready for Kubernetes when:

- `pnpm run ci` passes locally and in GitHub Actions;
- Docker Compose config validates;
- API and web images build successfully;
- the local stack starts cleanly;
- health and readiness checks pass;
- metrics are available to Prometheus;
- logs are collected through Promtail and Loki;
- k6 smoke/load checks pass;
- rollback demo works;
- security and CodeQL workflows are green;
- GHCR images are published and reachable in strict mode.

## Related Files

| File                                                                       | Purpose                                  |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| [`../scripts/kubernetes-readiness.sh`](../scripts/kubernetes-readiness.sh) | Main readiness validation script.        |
| [`../scripts/healthcheck.sh`](../scripts/healthcheck.sh)                   | Local stack health validation.           |
| [`../scripts/rollback-demo.sh`](../scripts/rollback-demo.sh)               | Local rollback workflow demo.            |
| [`../docker-compose.yml`](../docker-compose.yml)                           | Local runtime stack definition.          |
| [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml)               | Main CI workflow.                        |
| [`../.github/workflows/docker.yml`](../.github/workflows/docker.yml)       | Docker image publishing workflow.        |
| [`../.github/workflows/security.yml`](../.github/workflows/security.yml)   | Security scanning workflow.              |
| [`../.github/workflows/codeql.yml`](../.github/workflows/codeql.yml)       | CodeQL analysis workflow.                |
| [`../infra/terraform/aws`](../infra/terraform/aws)                         | Optional AWS Terraform validation layer. |
