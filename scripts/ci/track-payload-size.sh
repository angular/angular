#!/usr/bin/env bash

set -eu -o pipefail

# Source optional CI environment variables which are sandboxed out
# of the environment when running integration tests under Bazel
readonly bazelVarEnv="/tmp/bazel-ci-env.sh"
if [[ -f "$bazelVarEnv" ]]; then
  source $bazelVarEnv
fi

# If running locally, at a minimum set PROJECT_ROOT
if [[ -z "${PROJECT_ROOT:-}" ]]; then
  PROJECT_ROOT=$(cd $(dirname $0)/../..; pwd)
fi

source ${PROJECT_ROOT}/scripts/ci/payload-size.sh
trackPayloadSize "$@"
