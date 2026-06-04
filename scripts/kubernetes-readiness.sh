#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

CHECK_GHCR="${CHECK_GHCR:-auto}"
START_STACK="${START_STACK:-true}"
CHECK_TERRAFORM="${CHECK_TERRAFORM:-auto}"

check_file() {
  local path="$1"

  if [[ -f "$path" ]]; then
    success "Found ${path}"
  else
    die "Missing required file: ${path}"
  fi
}

check_command_output() {
  local name="$1"
  shift

  info "Checking ${name}"
  "$@" >/dev/null
  success "${name} passed"
}

check_no_hardcoded_localhost_in_source() {
  local matches

  info "Checking application source for hardcoded localhost references"

  matches="$(
    rg -n "localhost|127\\.0\\.0\\.1" apps/api/src apps/web/src \
      | rg -v "localUrl=|\\.test\\." || true
  )"

  if [[ -n "$matches" ]]; then
    printf "%s\n" "$matches"
    die "Application source contains hardcoded localhost references"
  fi

  success "Application source uses environment/relative runtime configuration"
}

check_docker_runtime_users() {
  info "Checking non-root runtime users in Dockerfiles"

  if ! rg -n "^USER node$" apps/api/Dockerfile >/dev/null; then
    die "API Dockerfile must set USER node"
  fi

  if ! rg -n "^USER 101$" apps/web/Dockerfile >/dev/null; then
    die "Web Dockerfile must set USER 101"
  fi

  success "Runtime containers use non-root users"
}

check_http_contains() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local response

  info "Checking ${name}: ${url}"
  response="$(curl -fsS --max-time 8 "$url")"

  if [[ "$response" == *"$expected"* ]]; then
    success "${name} returned expected content"
  else
    error "Unexpected response from ${name}:"
    printf "%s\n" "$response" >&2
    die "${name} did not contain expected text: ${expected}"
  fi
}

check_loki_ingestion() {
  local message
  local query
  local response

  message="Kubernetes handoff readiness $(date +%s)"

  info "Generating API log for Loki readiness"
  curl -fsS --max-time 8 \
    -X POST "http://localhost:${NGINX_PORT}/api/logs/generate" \
    -H "Content-Type: application/json" \
    -d "{\"level\":\"info\",\"message\":\"${message}\"}" >/dev/null

  query="{service=\"api\"} |= \"${message}\""
  info "Checking Loki ingestion for generated API log"

  for attempt in $(seq 1 20); do
    response="$(
      curl -G -fsS --max-time 8 "http://localhost:${LOKI_PORT}/loki/api/v1/query_range" \
        --data-urlencode "query=${query}" \
        --data-urlencode "limit=5" || true
    )"

    if [[ "$response" == *"\"status\":\"success\""* && "$response" == *"$message"* ]]; then
      success "Loki received generated API log"
      return 0
    fi

    info "Generated log not visible in Loki yet (${attempt}/20)"
    sleep 2
  done

  die "Loki did not return the generated API log"
}

detect_github_owner() {
  local remote
  local path

  remote="$(git config --get remote.origin.url || true)"

  case "$remote" in
    git@github.com:*)
      path="${remote#git@github.com:}"
      ;;
    https://github.com/*)
      path="${remote#https://github.com/}"
      ;;
    *)
      printf "itkrivoshei\n"
      return 0
      ;;
  esac

  path="${path%.git}"
  printf "%s\n" "${path%%/*}"
}

check_ghcr_image() {
  local owner="$1"
  local image="$2"
  local ref="ghcr.io/${owner}/${image}:latest"

  if [[ "$CHECK_GHCR" == "false" ]]; then
    warn "Skipping GHCR image check for ${ref}"
    return 0
  fi

  info "Checking GHCR image manifest: ${ref}"

  if docker manifest inspect "$ref" >/dev/null 2>&1; then
    success "GHCR image is reachable: ${ref}"
    return 0
  fi

  if [[ "$CHECK_GHCR" == "true" ]]; then
    die "GHCR image is not reachable: ${ref}"
  fi

  warn "GHCR image is not reachable yet in auto mode: ${ref}"
}

check_terraform_if_ready() {
  if [[ "$CHECK_TERRAFORM" == "false" ]]; then
    warn "Skipping Terraform readiness check"
    return 0
  fi

  if ! command -v terraform >/dev/null 2>&1; then
    warn "Terraform is not installed; skipping readiness validation"
    return 0
  fi

  if [[ ! -d infra/terraform/aws/.terraform ]]; then
    warn "Terraform is not initialized; run terraform init in infra/terraform/aws for strict validation"
    return 0
  fi

  check_command_output "Terraform fmt" terraform -chdir=infra/terraform/aws fmt -check -recursive
  check_command_output "Terraform validate" terraform -chdir=infra/terraform/aws validate
}

main() {
  local owner

  cd_project_root
  require_docker
  require_command curl
  require_command rg

  info "Running Kubernetes readiness checks..."

  check_file docker-compose.yml
  check_file apps/api/Dockerfile
  check_file apps/web/Dockerfile
  check_file scripts/healthcheck.sh
  check_file scripts/rollback-demo.sh
  check_file load/smoke-test.js
  check_file load/load-test.js
  check_file ops/prometheus/prometheus.yml
  check_file ops/grafana/dashboards/devops-control-center.json
  check_file ops/loki/loki-config.yml
  check_file ops/promtail/promtail-config.yml
  check_file .github/workflows/ci.yml
  check_file .github/workflows/docker.yml
  check_file .github/workflows/security.yml
  check_file infra/terraform/aws/main.tf

  check_no_hardcoded_localhost_in_source
  check_docker_runtime_users
  check_command_output "Docker Compose configuration" docker compose config --quiet

  if [[ "$START_STACK" == "true" ]]; then
    info "Starting local stack for readiness checks"
    docker compose up --build -d
  fi

  ./scripts/healthcheck.sh

  check_http_contains "Frontend" "http://localhost:${NGINX_PORT}" "<!doctype html>"
  check_http_contains "API health" "http://localhost:${NGINX_PORT}/api/health" '"status":"ok"'
  check_http_contains "API readiness" "http://localhost:${NGINX_PORT}/api/ready" '"status":"ready"'
  check_http_contains "API version" "http://localhost:${NGINX_PORT}/api/version" '"service":"devops-control-center-api"'
  check_http_contains "API metrics" "http://localhost:${NGINX_PORT}/api/metrics" "http_requests_total"
  check_http_contains "OpenAPI JSON" "http://localhost:${NGINX_PORT}/api/docs/json" '"openapi":"3.0.3"'
  check_http_contains "Prometheus API target" "http://localhost:${PROMETHEUS_PORT}/api/v1/targets" '"health":"up"'
  check_loki_ingestion

  owner="$(detect_github_owner)"
  check_ghcr_image "$owner" devops-control-center-api
  check_ghcr_image "$owner" devops-control-center-web
  check_terraform_if_ready

  success "Kubernetes readiness checks passed."
}

main "$@"
