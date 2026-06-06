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
CURRENT_REF="${CURRENT_REF:-HEAD}"
PREVIOUS_REF="${PREVIOUS_REF:-}"
CURRENT_VERSION="${CURRENT_VERSION:-1.1.0}"
PREVIOUS_VERSION="${PREVIOUS_VERSION:-1.0.0}"
CURRENT_COMMIT="${CURRENT_COMMIT:-}"
PREVIOUS_COMMIT="${PREVIOUS_COMMIT:-}"
CURRENT_SOURCE_COMMIT=""
PREVIOUS_SOURCE_COMMIT=""
BUILD_ROOT=""
DRY_RUN=false

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/rollback-demo.sh [rollback-version]
      Build different git refs, deploy current, roll back, and verify.

  ./scripts/rollback-demo.sh v1.0.0
      Run the rollback simulation with v1.0.0 as the rollback target.

  ./scripts/rollback-demo.sh --clean
      Stop and remove rollback demo containers/network.

  ./scripts/rollback-demo.sh --dry-run
      Resolve and verify rollback refs without building images.
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

cleanup_build_root() {
  if [[ -n "$BUILD_ROOT" && -d "$BUILD_ROOT" ]]; then
    rm -rf "$BUILD_ROOT"
  fi
}

resolve_refs() {
  CURRENT_SOURCE_COMMIT="$(git rev-parse --verify "${CURRENT_REF}^{commit}")" ||
    die "Current rollback ref does not resolve to a commit: ${CURRENT_REF}"

  if [[ -z "$PREVIOUS_REF" ]]; then
    if git show-ref --verify --quiet refs/remotes/origin/main &&
      [[ "$(git rev-parse --verify 'origin/main^{commit}')" != "$CURRENT_SOURCE_COMMIT" ]]; then
      PREVIOUS_REF="origin/main"
    elif git rev-parse --verify "${CURRENT_REF}^" >/dev/null 2>&1; then
      PREVIOUS_REF="${CURRENT_REF}^"
    else
      die "Could not select a previous rollback ref; set PREVIOUS_REF explicitly"
    fi
  fi

  PREVIOUS_SOURCE_COMMIT="$(git rev-parse --verify "${PREVIOUS_REF}^{commit}")" ||
    die "Previous rollback ref does not resolve to a commit: ${PREVIOUS_REF}"

  if [[ "$CURRENT_SOURCE_COMMIT" == "$PREVIOUS_SOURCE_COMMIT" ]]; then
    die "Rollback refs must resolve to different commits: ${CURRENT_REF} and ${PREVIOUS_REF}"
  fi

  CURRENT_COMMIT="${CURRENT_COMMIT:-$CURRENT_SOURCE_COMMIT}"
  PREVIOUS_COMMIT="${PREVIOUS_COMMIT:-$PREVIOUS_SOURCE_COMMIT}"

  info "Current rollback ref: ${CURRENT_REF} (${CURRENT_SOURCE_COMMIT})"
  info "Previous rollback ref: ${PREVIOUS_REF} (${PREVIOUS_SOURCE_COMMIT})"
}

build_demo_images() {
  BUILD_ROOT="$(mktemp -d)"

  mkdir -p "$BUILD_ROOT/current" "$BUILD_ROOT/previous"
  git archive "$CURRENT_REF" | tar -x -C "$BUILD_ROOT/current"
  git archive "$PREVIOUS_REF" | tar -x -C "$BUILD_ROOT/previous"

  info "Building previous API image from ${PREVIOUS_REF} (${PREVIOUS_SOURCE_COMMIT})"
  docker build \
    -f "$BUILD_ROOT/previous/apps/api/Dockerfile" \
    -t "$PREVIOUS_IMAGE" \
    "$BUILD_ROOT/previous"

  info "Building current API image from ${CURRENT_REF} (${CURRENT_SOURCE_COMMIT})"
  docker build \
    -f "$BUILD_ROOT/current/apps/api/Dockerfile" \
    -t "$CURRENT_IMAGE" \
    "$BUILD_ROOT/current"

  if [[ "$(docker image inspect --format '{{.Id}}' "$CURRENT_IMAGE")" == "$(docker image inspect --format '{{.Id}}' "$PREVIOUS_IMAGE")" ]]; then
    die "Rollback images are identical; use refs with different application content"
  fi

  cleanup_build_root
  BUILD_ROOT=""
}

wait_for_api() {
  local url="${ROLLBACK_BASE_URL}/health"

  info "Waiting for rollback API health: ${url}"

  for attempt in $(seq 1 30); do
    if curl -fs --max-time 3 "$url" >/dev/null; then
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

parse_args() {
  case "${1:-}" in
    --clean)
      require_docker
      clean_rollback
      exit 0
      ;;
    --dry-run)
      DRY_RUN=true
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    "")
      ;;
    *)
      if [[ "$1" == -* ]]; then
        usage
        die "Unknown argument: $1"
      fi

      if [[ $# -gt 1 ]]; then
        usage
        die "Rollback demo accepts one optional rollback version."
      fi

      PREVIOUS_VERSION="$1"
      ;;
  esac
}

main() {
  cd_project_root
  trap cleanup_build_root EXIT

  parse_args "$@"
  require_command git
  resolve_refs

  if [[ "$DRY_RUN" == "true" ]]; then
    success "Rollback refs are valid and resolve to different commits."
    return 0
  fi

  require_docker
  require_command curl
  clean_rollback
  build_demo_images

  deploy_api "$CURRENT_IMAGE" "$CURRENT_VERSION" "$CURRENT_COMMIT" "current release"
  deploy_api "$PREVIOUS_IMAGE" "$PREVIOUS_VERSION" "$PREVIOUS_COMMIT" "rollback target"

  success "Rollback demo completed. The rollback target is running at ${ROLLBACK_BASE_URL}."
  info "Run ./scripts/rollback-demo.sh --clean when finished."
}

main "$@"
