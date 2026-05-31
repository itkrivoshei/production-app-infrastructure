#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

cd_project_root
require_command curl

check_url() {
  local name="$1"
  local url="$2"

  info "Checking ${name}: ${url}"

  if curl -fsS --max-time 5 "$url" >/dev/null; then
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
  response="$(curl -fsS --max-time 5 "$url")"

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
check_json_contains "API direct" "http://localhost:${API_PORT}/health" '"status":"ok"'
check_url "Prometheus readiness" "http://localhost:${PROMETHEUS_PORT}/-/ready"
check_json_contains "Prometheus API target" "http://localhost:${PROMETHEUS_PORT}/api/v1/targets" '"job":"devops-control-center-api"'
check_json_contains "Prometheus target health" "http://localhost:${PROMETHEUS_PORT}/api/v1/targets" '"health":"up"'
check_url "Grafana health" "http://localhost:${GRAFANA_PORT}/api/health"
check_json_contains "Grafana dashboard provisioning" "http://localhost:${GRAFANA_PORT}/api/search?query=DevOps" '"title":"DevOps Control Center"'
check_url "Loki readiness" "http://localhost:${LOKI_PORT}/ready"
check_url "Loki metrics endpoint" "http://localhost:${LOKI_PORT}/metrics"
check_url "Promtail readiness" "http://localhost:${PROMTAIL_PORT}/ready"
check_loki_has_labels

success "All health checks passed."
