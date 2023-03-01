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

# Bazel payload size tracking should always be treated as if this runs as part of
# a pull request. i.e. the results are not uploaded. This is necessary as Bazel test
# targets do not necessarily run for every commit, and cached results might originate
# from RBE-built pull requests. We will overhaut size-tracking anyway..
export CI_PULL_REQUEST="true"

source ${PROJECT_ROOT}/scripts/ci/payload-size.sh
trackPayloadSize "$@"
