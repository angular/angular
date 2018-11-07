#!/usr/bin/env bash
source ./scripts/ci/sources/tunnel.sh

is_e2e() {
  [[ "${MODE}" = e2e ]]
}

is_lint() {
  [[ "${MODE}" = lint ]]
}

is_aot() {
  [[ "${MODE}" = aot ]]
}

is_unit() {
  [[ "${MODE}" =~ ^.*_(optional|required)$ ]]
}

is_prerender() {
  [[ "$MODE" = prerender ]]
}
