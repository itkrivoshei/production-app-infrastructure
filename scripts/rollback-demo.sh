#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

ROLLBACK_COMPOSE_FILE="${ROLLBACK_COMPOSE_FILE:-ops/rollback/docker-compose.rollback.yml}"
ROLLBACK_PROJECT_NAME="${ROLLBACK_PROJECT_NAME:-production-app-rollback-demo}"
ROLLBACK_PORT="${ROLLBACK_PORT:-8091}"
ROLLBACK_BASE_URL="${ROLLBACK_BASE_URL:-http://localhost:${ROLLBACK_PORT}}"
CURRENT_IMAGE="${CURRENT_IMAGE:-devops-control-center-api:rollback-current}"
PREVIOUS_IMAGE="${PREVIOUS_IMAGE:-devops-control-center-api:rollback-previous}"
CURRENT_VERSION="${CURRENT_VERSION:-0.2.0}"
PREVIOUS_VERSION="${PREVIOUS_VERSION:-0.1.0}"
CURRENT_COMMIT="${CURRENT_COMMIT:-rollback-current}"
PREVIOUS_COMMIT="${PREVIOUS_COMMIT:-rollback-previous}"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/rollback-demo.sh          Build demo images, deploy current, roll back to previous, and verify.
  ./scripts/rollback-demo.sh --clean  Stop and remove rollback demo containers/network.
USAGE
}

rollback_compose() {
  docker compose --project-name "$ROLLBACK_PROJECT_NAME" -f "$ROLLBACK_COMPOSE_FILE" "$@"
}

clean_rollback() {
  info "Cleaning rollback demo resources..."
  rollback_compose down --remove-orphans
  success "Rollback demo resources cleaned."
}

build_demo_images() {
  info "Building previous API image: ${PREVIOUS_IMAGE}"
  docker build -f apps/api/Dockerfile -t "$PREVIOUS_IMAGE" .

  info "Building current API image: ${CURRENT_IMAGE}"
  docker build -f apps/api/Dockerfile -t "$CURRENT_IMAGE" .
}

wait_for_api() {
  local url="${ROLLBACK_BASE_URL}/health"

  info "Waiting for rollback API health: ${url}"

  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 3 "$url" >/dev/null; then
      success "Rollback API is healthy"
      return 0
    fi

    info "Rollback API is not ready yet (${attempt}/30)"
    sleep 1
  done

  rollback_compose logs api >&2 || true
  die "Rollback API did not become healthy: ${url}"
}

assert_version() {
  local expected_version="$1"
  local expected_commit="$2"
  local response

  response="$(curl -fsS --max-time 5 "${ROLLBACK_BASE_URL}/version")"

  if [[ "$response" == *"\"version\":\"${expected_version}\""* && "$response" == *"\"commit\":\"${expected_commit}\""* ]]; then
    success "Rollback API version matches ${expected_version} (${expected_commit})"
    return 0
  fi

  error "Unexpected /version response:"
  printf "%s\n" "$response" >&2
  die "Expected version=${expected_version}, commit=${expected_commit}"
}

deploy_api() {
  local image="$1"
  local version="$2"
  local commit="$3"
  local label="$4"

  info "Deploying ${label}: image=${image}, version=${version}, commit=${commit}"

  ROLLBACK_IMAGE="$image" \
    APP_VERSION="$version" \
    COMMIT_SHA="$commit" \
    ROLLBACK_PORT="$ROLLBACK_PORT" \
    rollback_compose up -d --force-recreate

  wait_for_api
  assert_version "$version" "$commit"
}

main() {
  cd_project_root
  require_docker
  require_command curl

  case "${1:-}" in
    --clean)
      clean_rollback
      exit 0
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    "")
      ;;
    *)
      usage
      die "Unknown argument: $1"
      ;;
  esac

  clean_rollback
  build_demo_images

  deploy_api "$CURRENT_IMAGE" "$CURRENT_VERSION" "$CURRENT_COMMIT" "current release"
  deploy_api "$PREVIOUS_IMAGE" "$PREVIOUS_VERSION" "$PREVIOUS_COMMIT" "rollback target"

  success "Rollback demo completed. The rollback target is running at ${ROLLBACK_BASE_URL}."
  info "Run ./scripts/rollback-demo.sh --clean when finished."
}

main "$@"
