#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

MODE="${1:-up}"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/dev.sh [up|detached|down]
USAGE
}

[[ $# -le 1 ]] || {
  usage
  die "dev.sh accepts at most one mode"
}

if [[ "$MODE" == "-h" || "$MODE" == "--help" ]]; then
  usage
  exit 0
fi

cd_project_root
require_docker

case "$MODE" in
  up)
    info "Starting local Docker stack with rebuild..."
    compose up --build
    ;;
  detached | -d | --detach)
    info "Starting local Docker stack in detached mode with rebuild..."
    compose up --build -d
    success "Stack started in detached mode."
    info "Frontend: http://localhost:${NGINX_PORT}"
    info "API health: http://localhost:${NGINX_PORT}/api/health"
    ;;
  down)
    info "Stopping local Docker stack..."
    compose down
    success "Stack stopped."
    ;;
  *)
    usage
    die "Unknown mode: $MODE"
    ;;
esac
