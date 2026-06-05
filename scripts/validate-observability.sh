#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

main() {
  cd_project_root
  require_docker

  info "Validating Prometheus configuration and alert rules"
  docker run --rm \
    --entrypoint promtool \
    -v "$PWD/ops/prometheus:/etc/prometheus:ro" \
    prom/prometheus:v2.55.1 \
    check config /etc/prometheus/prometheus.yml

  info "Validating Grafana Alloy configuration"
  docker run --rm \
    -v "$PWD/ops/alloy/config.alloy:/etc/alloy/config.alloy:ro" \
    -v /var/run/docker.sock:/var/run/docker.sock:ro \
    grafana/alloy:v1.11.3 \
    validate /etc/alloy/config.alloy

  success "Observability configuration is valid."
}

main "$@"
