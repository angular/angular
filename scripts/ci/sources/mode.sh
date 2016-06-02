#!/usr/bin/env bash
source ./scripts/ci/sources/tunnel.sh

is_e2e() {
  [[ "$MODE" = e2e ]]
}

is_lint() {
  [[ "$MODE" = lint ]]
}

is_circular_deps_check() {
  [[ "$MODE" = circular_deps ]]
}
