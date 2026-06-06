#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

BASE_URL="${1:-${AWS_DEMO_BASE_URL:-}}"
EXPECTED_APP_VERSION="${EXPECTED_APP_VERSION:-}"
EXPECTED_COMMIT_SHA="${EXPECTED_COMMIT_SHA:-}"

if [[ -z "$BASE_URL" ]]; then
  die "Usage: ./scripts/aws-smoke.sh <http://ec2-public-ip>"
fi

BASE_URL="${BASE_URL%/}"

assert_contains() {
  local name="$1"
  local response="$2"
  local expected="$3"

  if [[ "$response" != *"$expected"* ]]; then
    die "${name} did not contain expected text: ${expected}"
  fi
}

assert_header() {
  local headers="$1"
  local header="$2"

  if ! grep -qi "^${header}:" <<<"$headers"; then
    die "Expected response header is missing: ${header}"
  fi
}

info "Checking safe AWS deployment at ${BASE_URL}"
headers="$(curl -fsSI --max-time 10 "${BASE_URL}/" | tr -d '\r')"
curl -fsS --max-time 10 "${BASE_URL}/" >/dev/null
curl -fsS --max-time 10 "${BASE_URL}/api/health" >/dev/null
overview="$(curl -fsS --max-time 10 "${BASE_URL}/api/overview")"
version="$(curl -fsS --max-time 10 "${BASE_URL}/api/version")"

assert_header "$headers" "Content-Security-Policy"
assert_header "$headers" "Permissions-Policy"
assert_header "$headers" "X-Content-Type-Options"
assert_contains "API overview" "$overview" '"mode":"safe"'

if [[ -n "$EXPECTED_APP_VERSION" ]]; then
  assert_contains "API version" "$version" "\"version\":\"${EXPECTED_APP_VERSION}\""
fi

if [[ -n "$EXPECTED_COMMIT_SHA" ]]; then
  assert_contains "API version" "$version" "\"commit\":\"${EXPECTED_COMMIT_SHA}\""
fi

for route in load/cpu load/errors logs/generate; do
  status="$(
    curl -sS -o /dev/null -w '%{http_code}' --max-time 10 \
      -X POST -H 'X-Demo-Action: true' "${BASE_URL}/api/${route}"
  )"

  if [[ "$status" != "404" ]]; then
    die "Expected /api/${route} to be unavailable in safe mode, got HTTP ${status}"
  fi
done

success "AWS safe deployment smoke check passed."
