# CI/CD

GitHub Actions workflows live in [`.github/workflows`](../.github/workflows).

The pipeline is designed to keep local development, pull request validation, image publishing, security checks, and GitHub Pages deployment aligned.

## Workflows

| Workflow                                            | Purpose                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](../.github/workflows/ci.yml)             | Runs coverage, Terraform/Compose/observability validation, Compose integration, k6, and browser E2E.                      |
| [`docker.yml`](../.github/workflows/docker.yml)     | Builds API/web images and publishes them with SBOM and provenance on `main` and tags.                                      |
| [`security.yml`](../.github/workflows/security.yml) | Runs Trivy filesystem/image scans, Hadolint, and ShellCheck.                                                              |
| [`codeql.yml`](../.github/workflows/codeql.yml)     | Runs GitHub CodeQL security analysis.                                                                                     |
| [`pages.yml`](../.github/workflows/pages.yml)       | Builds and publishes the static dashboard demo to GitHub Pages.                                                           |

## Pipeline Gates

| Gate               | What it validates                                                               |
| ------------------ | ------------------------------------------------------------------------------- |
| Install            | Dependencies resolve from the lockfile.                                         |
| Lint / Typecheck   | Source code, TypeScript types, and formatting-sensitive checks pass.            |
| Tests / coverage   | API and web suites pass the configured coverage thresholds.                     |
| Docs links         | Relative Markdown links resolve to files in the repository.                     |
| Build              | API and web packages build successfully.                                        |
| Compose validation | Docker Compose configuration is valid before runtime checks.                    |
| Integration        | Safe/demo Compose, k6 smoke, and local browser E2E pass.                        |
| Infra validation   | Terraform, safe/demo Compose, Prometheus rules, and Alloy config validate.       |
| Security scans     | Source, images, Dockerfiles, and shell scripts pass configured security checks. |
| Deployment         | The static demo can be built and published through GitHub Pages.                |

## Local Equivalent

Run the main CI path locally before opening or updating a pull request:

```bash
pnpm install
pnpm run ci
docker compose config --quiet
pnpm observability:validate
RUN_BROWSER_E2E=true pnpm integration:compose
pnpm e2e:pages
```

Run project handoff checks:

```bash
pnpm readiness
```

Run the local runtime smoke path:

```bash
RUN_BROWSER_E2E=true pnpm integration:compose
```

## GHCR Images

The Docker workflow publishes API and web images to GitHub Container Registry.

```text
ghcr.io/itkrivoshei/devops-control-center-api:latest
ghcr.io/itkrivoshei/devops-control-center-api:sha-<short-sha>
ghcr.io/itkrivoshei/devops-control-center-web:latest
ghcr.io/itkrivoshei/devops-control-center-web:sha-<short-sha>
```

Check published image manifests after the Docker workflow completes:

```bash
docker manifest inspect ghcr.io/itkrivoshei/devops-control-center-api:latest
docker manifest inspect ghcr.io/itkrivoshei/devops-control-center-web:latest
```

## Pull Request Expectations

Before merging, the pull request should have green checks for:

- CI
- Docker image build
- Security scans
- CodeQL
- GitHub Pages build, when demo files are affected
- Both CodeQL languages: `actions` and `javascript-typescript`

Recommended local pre-merge check:

```bash
pnpm run ci
docker compose config
pnpm observability:validate
pnpm readiness
```

For runtime-sensitive changes, also run:

```bash
RUN_BROWSER_E2E=true pnpm integration:compose
```

## Release Flow

Main branch updates trigger the delivery path:

```text
Pull Request
  -> CI
  -> Security
  -> CodeQL
  -> Merge to main
  -> Docker image publish
  -> GitHub Pages deploy
```

Tagged releases publish immutable image tags through the Docker workflow.
