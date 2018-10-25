#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# run in subshell to avoid polluting cwd
(
  cd ${PROJECT_ROOT}/aio


  # Run PWA-score tests
  # (Run before unit and e2e tests, which destroy the `dist/` directory.)
  travisFoldStart "test.aio.pwaScore"
    yarn test-pwa-score-localhost $AIO_MIN_PWA_SCORE
  travisFoldEnd "test.aio.pwaScore"

  # Run unit tests
  travisFoldStart "test.aio.unit"
    yarn test --watch=false
  travisFoldEnd "test.aio.unit"

  # Run e2e tests
  travisFoldStart "test.aio.e2e"
    yarn e2e
  travisFoldEnd "test.aio.e2e"
)
