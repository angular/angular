#!/usr/bin/env bash

set -u -e -o pipefail

readonly SCRIPT_DIR=$(cd $(dirname $0); pwd)
if [[ -f ${SCRIPT_DIR}/sauce-service.sh ]]; then
  readonly SAUCE_SERVICE="${SCRIPT_DIR}/sauce-service.sh"
else
  # Path in runfiles tree (when running under Bazel)
  readonly SAUCE_SERVICE="./scripts/saucelabs/sauce-service.sh"
fi
${SAUCE_SERVICE} start
