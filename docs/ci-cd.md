# CI/CD

GitHub Actions workflows live in [`.github/workflows`](../.github/workflows).

The pipeline is designed to keep local development, pull request validation, image publishing, security checks, and GitHub Pages deployment aligned.

## Workflows

| Workflow                                            | Purpose                                                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](../.github/workflows/ci.yml)             | Installs dependencies, runs lint/typecheck/test/build checks, validates Docker Compose config, and builds API/web images. |
| [`docker.yml`](../.github/workflows/docker.yml)     | Builds API and web Docker images and publishes them to GitHub Container Registry on `main` and tags.                      |
| [`security.yml`](../.github/workflows/security.yml) | Runs Trivy filesystem/image scans, Hadolint, and ShellCheck.                                                              |
| [`codeql.yml`](../.github/workflows/codeql.yml)     | Runs GitHub CodeQL security analysis.                                                                                     |
| [`pages.yml`](../.github/workflows/pages.yml)       | Builds and publishes the static dashboard demo to GitHub Pages.                                                           |

## Pipeline Gates

| Gate               | What it validates                                                               |
| ------------------ | ------------------------------------------------------------------------------- |
| Install            | Dependencies resolve from the lockfile.                                         |
| Lint / Typecheck   | Source code, TypeScript types, and formatting-sensitive checks pass.            |
| Tests              | Application test suite passes before build and image validation.                |
| Build              | API and web packages build successfully.                                        |
| Compose validation | Docker Compose configuration is valid before runtime checks.                    |
| Image build        | API and web Docker images build without relying on local-only state.            |
| Security scans     | Source, images, Dockerfiles, and shell scripts pass configured security checks. |
| Deployment         | The static demo can be built and published through GitHub Pages.                |

## Local Equivalent

Run the main CI path locally before opening or updating a pull request:

```bash
pnpm install
pnpm run ci
docker compose config --quiet
docker compose build api web
```

Run project handoff checks:

```bash
./scripts/kubernetes-readiness.sh
```

Run the local runtime smoke path:

```bash
docker compose up --build -d
./scripts/healthcheck.sh
pnpm k6:docker:smoke
docker compose down
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

Recommended local pre-merge check:

```bash
pnpm run ci
docker compose config
./scripts/kubernetes-readiness.sh
```

For runtime-sensitive changes, also run:

```bash
docker compose up --build -d
./scripts/healthcheck.sh
pnpm k6:docker:smoke
docker compose down
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
