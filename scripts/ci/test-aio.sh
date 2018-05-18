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


  # Run PWA-score tests
  # (Run before unit and e2e tests, which destroy the `dist/` directory.)
  travisFoldStart "test.aio.pwaScore"
    yarn test-pwa-score-localhost
  travisFoldEnd "test.aio.pwaScore"

  # Check the bundle sizes.
  # (Run before unit and e2e tests, which destroy the `dist/` directory.)
  travisFoldStart "test.aio.payload-size"
    yarn payload-size
  travisFoldEnd "test.aio.payload-size"

  # Run unit tests
  travisFoldStart "test.aio.unit"
    yarn test --watch=false
  travisFoldEnd "test.aio.unit"

  # Run e2e tests
  travisFoldStart "test.aio.e2e"
    yarn e2e
  travisFoldEnd "test.aio.e2e"

  # Run unit tests for Firebase redirects
  travisFoldStart "test.aio.redirects"
    yarn redirects-test
  travisFoldEnd "test.aio.redirects"

  # Run unit tests for aio/aio-builds-setup
  travisFoldStart "test.aio.aio-builds-setup"
    ./aio-builds-setup/scripts/test.sh
  travisFoldEnd "test.aio.aio-builds-setup"
)
