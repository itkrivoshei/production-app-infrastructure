# CI/CD

GitHub Actions live in `.github/workflows`.

| Workflow | Purpose |
| --- | --- |
| `ci.yml` | Install dependencies, run lint/typecheck/test/build, validate Compose, build API and web images. |
| `docker.yml` | Build API and web Docker images and publish to GHCR on main and tags. |
| `security.yml` | Run Trivy filesystem/image scans, Hadolint, and ShellCheck. |
| `codeql.yml` | Run CodeQL security analysis. |

## Local Equivalent

```bash
pnpm install
pnpm run ci
docker compose config --quiet
docker compose build api web
```

## GHCR Images

The Docker workflow publishes:

```text
ghcr.io/<owner>/devops-control-center-api:latest
ghcr.io/<owner>/devops-control-center-api:sha-<short-sha>
ghcr.io/<owner>/devops-control-center-web:latest
ghcr.io/<owner>/devops-control-center-web:sha-<short-sha>
```

Pull checks after the workflow has published packages:

```bash
docker manifest inspect ghcr.io/<owner>/devops-control-center-api:latest
docker manifest inspect ghcr.io/<owner>/devops-control-center-web:latest
```

## PR Expectations

Before merging:

```bash
pnpm run ci
docker compose config
./scripts/project2-readiness.sh
```

The PR should show green CI, Docker image build, security, and CodeQL checks.
