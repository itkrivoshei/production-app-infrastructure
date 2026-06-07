#!/usr/bin/env bash
set -Eeuo pipefail

# shellcheck source=scripts/lib/common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

expect_failure() {
  local name="$1"
  shift

  if "$@" >/dev/null 2>&1; then
    die "${name} unexpectedly succeeded"
  fi
}

main() {
  cd_project_root

  for script in dev.sh clean.sh logs.sh restart.sh healthcheck.sh rollback-demo.sh; do
    "./scripts/${script}" --help >/dev/null
  done

  expect_failure "rollback dry-run extra argument" ./scripts/rollback-demo.sh --dry-run extra
  expect_failure "rollback clean extra argument" ./scripts/rollback-demo.sh --clean extra
  expect_failure "rollback help extra argument" ./scripts/rollback-demo.sh --help extra
  expect_failure "dev extra argument" ./scripts/dev.sh up extra
  expect_failure "clean unknown argument" ./scripts/clean.sh extra
  expect_failure "logs extra argument" ./scripts/logs.sh api extra
  expect_failure "restart extra argument" ./scripts/restart.sh api extra
  expect_failure "healthcheck unknown argument" ./scripts/healthcheck.sh extra

  PREVIOUS_REF=HEAD^ ./scripts/rollback-demo.sh --dry-run >/dev/null

  success "Shell CLI contracts passed."
}

main "$@"
