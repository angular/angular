#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh

# run in subshell to avoid polluting cwd
(
  cd ${PROJECT_ROOT}/aio
  # Run e2e tests
  travisFoldStart "test.aio.e2e"
    yarn setup
    for i in `seq 1 10`; do
      yarn e2e;
    done
  travisFoldEnd "test.aio.e2e"
)
