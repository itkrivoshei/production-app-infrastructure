#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

BASE_URL="${1:-${AWS_DEMO_BASE_URL:-}}"

if [[ -z "$BASE_URL" ]]; then
  die "Usage: ./scripts/aws-smoke.sh <http://ec2-public-ip>"
fi

BASE_URL="${BASE_URL%/}"

info "Checking safe AWS deployment at ${BASE_URL}"
curl -fsS --max-time 10 "${BASE_URL}/" >/dev/null
curl -fsS --max-time 10 "${BASE_URL}/api/health" >/dev/null
curl -fsS --max-time 10 "${BASE_URL}/api/overview" >/dev/null

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
