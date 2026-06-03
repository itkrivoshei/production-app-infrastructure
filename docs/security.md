# Security

Security checks are automated through [`security.yml`](../.github/workflows/security.yml), with CodeQL running separately in [`codeql.yml`](../.github/workflows/codeql.yml).

The goal is to catch high-impact issues before merge: vulnerable dependencies, leaked secrets, Dockerfile misconfigurations, vulnerable container images, and unsafe shell scripts.

## Security Pipeline

| Check             | Tool       | Purpose                                                                 |
| ----------------- | ---------- | ----------------------------------------------------------------------- |
| Filesystem scan   | Trivy      | Scans source files for vulnerabilities, secrets, and misconfigurations. |
| Image scan        | Trivy      | Scans final API and web container images for vulnerable packages.       |
| Dockerfile lint   | Hadolint   | Checks Dockerfiles for maintainability and security issues.             |
| Shell script lint | ShellCheck | Checks Bash scripts for unsafe patterns and common errors.              |
| Static analysis   | CodeQL     | Runs GitHub semantic code analysis in a separate workflow.              |

## CI Scope

The security workflow checks:

- repository source files;
- Dockerfiles;
- shell scripts in `scripts/`;
- final API Docker image;
- final web Docker image.

Generated and dependency-heavy folders are skipped where appropriate:

- `node_modules`
- `apps/api/dist`
- `apps/web/dist`

## Local Prerequisites

Install the local tools when you want to reproduce CI checks manually:

| Tool       | Install / Docs                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Trivy      | [Trivy installation](https://aquasecurity.github.io/trivy/latest/getting-started/installation/) |
| ShellCheck | [ShellCheck installation](https://github.com/koalaman/shellcheck#installing)                    |
| Docker     | [Docker installation](https://docs.docker.com/get-docker/)                                      |

Hadolint is run through Docker, so no local binary is required.

## Local Filesystem Scan

```bash
trivy fs --scanners vuln,secret,misconfig \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  --skip-dirs node_modules \
  --skip-dirs apps/api/dist \
  --skip-dirs apps/web/dist \
  .
```

## Local Image Scans

Build the final local images:

```bash
docker build -f apps/api/Dockerfile -t devops-control-center-api:local .
docker build -f apps/web/Dockerfile -t devops-control-center-web:local .
```

Scan the API image:

```bash
trivy image --scanners vuln \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  devops-control-center-api:local
```

Scan the web image:

```bash
trivy image --scanners vuln \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  devops-control-center-web:local
```

## Dockerfile Lint

```bash
docker run --rm -i hadolint/hadolint:v2.12.0-alpine \
  hadolint --ignore DL3002 - < apps/api/Dockerfile

docker run --rm -i hadolint/hadolint:v2.12.0-alpine \
  hadolint --ignore DL3002 - < apps/web/Dockerfile
```

`DL3002` is ignored intentionally because the runtime images use container-specific user handling where practical.

## Shell Script Checks

```bash
shellcheck -x scripts/*.sh scripts/lib/*.sh
```

## CodeQL

CodeQL runs in a separate GitHub Actions workflow:

```text
.github/workflows/codeql.yml
```

It provides semantic code analysis for supported languages and reports findings in GitHub Security / Code scanning.

## Pull Request Expectations

Before merging, the pull request should have green checks for:

- security workflow;
- CodeQL workflow;
- CI workflow;
- Docker image build workflow.

For security-sensitive changes, run the local checks before pushing:

```bash
pnpm run ci
trivy fs --scanners vuln,secret,misconfig \
  --severity HIGH,CRITICAL \
  --ignore-unfixed \
  --exit-code 1 \
  --skip-dirs node_modules \
  --skip-dirs apps/api/dist \
  --skip-dirs apps/web/dist \
  .
shellcheck -x scripts/*.sh scripts/lib/*.sh
```

## Triage Rules

| Finding                | Action                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| Critical vulnerability | Fix before merge unless it is proven unreachable or false positive. |
| High vulnerability     | Fix or document why it is acceptable temporarily.                   |
| Secret finding         | Treat as sensitive and rotate the secret if real.                   |
| Dockerfile issue       | Fix unless the exception is intentional and documented.             |
| ShellCheck issue       | Fix or add a narrow inline suppression with a reason.               |

## Notes

Security checks are designed as merge gates, not as a replacement for production security review. The project uses local demo infrastructure and does not store production secrets in the repository.
