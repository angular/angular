#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# run in subshell to avoid polluting cwd
(
  cd ${PROJECT_ROOT}/aio


  # Lint the code
  travisFoldStart "test.aio.lint"
    yarn lint
  travisFoldEnd "test.aio.lint"


  # Run unit tests
  travisFoldStart "test.aio.unit"
    yarn test -- --single-run
  travisFoldEnd "test.aio.unit"


  # Run e2e tests
  travisFoldStart "test.aio.e2e"
    yarn e2e
  travisFoldEnd "test.aio.e2e"

  # Run PWA-score tests
  travisFoldStart "test.aio.pwaScore"
    yarn test-pwa-score-local
  travisFoldEnd "test.aio.pwaScore"

  # Run unit tests for aio/aio-builds-setup
  travisFoldStart "test.aio.aio-builds-setup"
    ./aio-builds-setup/scripts/test.sh
  travisFoldEnd "test.aio.aio-builds-setup"
)
