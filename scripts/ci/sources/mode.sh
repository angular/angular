#!/usr/bin/env bash
source ./scripts/ci/sources/tunnel.sh

is_dart() {
  [[ "$MODE" = dart* ]]
}