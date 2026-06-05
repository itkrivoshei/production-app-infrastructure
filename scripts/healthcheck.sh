#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_command curl

HTTP_RETRIES="${HTTP_RETRIES:-15}"
HTTP_RETRY_DELAY_SECONDS="${HTTP_RETRY_DELAY_SECONDS:-2}"
FULL_STACK="${FULL_STACK:-false}"

fetch_with_retry() {
  local name="$1"
  local url="$2"
  local response

  for attempt in $(seq 1 "$HTTP_RETRIES"); do
    if response="$(curl -fsS --max-time 5 "$url")"; then
      printf "%s" "$response"
      return 0
    fi

    info "${name} is not ready yet (${attempt}/${HTTP_RETRIES})" >&2
    sleep "$HTTP_RETRY_DELAY_SECONDS"
  done

  return 1
}

check_url() {
  local name="$1"
  local url="$2"

  info "Checking ${name}: ${url}"

  if fetch_with_retry "$name" "$url" >/dev/null; then
    success "${name} is healthy"
  else
    die "${name} health check failed: ${url}"
  fi
}

check_json_contains() {
  local name="$1"
  local url="$2"
  local expected="$3"

  info "Checking ${name}: ${url}"

  local response
  if ! response="$(fetch_with_retry "$name" "$url")"; then
    die "${name} health check failed: ${url}"
  fi

  if [[ "$response" == *"$expected"* ]]; then
    success "${name} returned expected response"
  else
    error "Unexpected response from ${name}:"
    printf "%s\n" "$response"
    die "${name} did not contain expected text: $expected"
  fi
}

check_loki_has_labels() {
  local url="http://localhost:${LOKI_PORT}/loki/api/v1/labels"

  info "Checking Loki labels: ${url}"

  local response
  response="$(curl -fsS --max-time 5 "$url")"

  if [[ "$response" == *"service"* ]]; then
    success "Loki has service labels"
  else
    warn "Loki is healthy, but service labels are not visible yet. Generate logs and retry."
  fi
}

info "Running local stack health checks..."

check_url "Frontend through Nginx" "http://localhost:${NGINX_PORT}"
check_url "Nginx" "http://localhost:${NGINX_PORT}/nginx-health"
check_json_contains "API through Nginx" "http://localhost:${NGINX_PORT}/api/health" '"status":"ok"'

if [[ "$FULL_STACK" == "true" ]]; then
  check_url "Prometheus readiness" "http://localhost:${PROMETHEUS_PORT}/-/ready"
  check_json_contains "Prometheus API target" "http://localhost:${PROMETHEUS_PORT}/api/v1/targets" '"job":"devops-control-center-api"'
  check_json_contains "Prometheus target health" "http://localhost:${PROMETHEUS_PORT}/api/v1/targets" '"health":"up"'
  check_url "Grafana health" "http://localhost:${GRAFANA_PORT}/api/health"
  check_json_contains "Grafana dashboard provisioning" "http://localhost:${GRAFANA_PORT}/api/search?query=DevOps" '"title":"DevOps Control Center"'
  check_url "Loki readiness" "http://localhost:${LOKI_PORT}/ready"
  check_url "Loki metrics endpoint" "http://localhost:${LOKI_PORT}/metrics"
  check_url "Alloy readiness" "http://localhost:${ALLOY_PORT}/-/ready"
  check_loki_has_labels
fi

success "All health checks passed."
