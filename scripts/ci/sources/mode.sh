#!/usr/bin/env bash
source ./scripts/ci/sources/tunnel.sh

is_dart() {
  [[ "$MODE" = dart* ]]
}

is_e2e() {
  [[ "$MODE" = e2e ]]
}

is_lint() {
  [[ "$MODE" = lint ]]
}