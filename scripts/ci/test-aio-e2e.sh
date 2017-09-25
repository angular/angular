#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# run in subshell to avoid polluting cwd
(
  cd ${PROJECT_ROOT}/aio

  # Run example e2e tests
  travisFoldStart "test.aio.example-e2e"
    yarn example-e2e -- --setup --local --shard=${AIO_SHARD}/2
  travisFoldEnd "test.aio.example-e2e"
)
