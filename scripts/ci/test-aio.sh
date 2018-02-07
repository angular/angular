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


  # Run unit tests
  travisFoldStart "test.aio.unit"
    yarn test --single-run
  travisFoldEnd "test.aio.unit"


  # Run e2e tests
  travisFoldStart "test.aio.e2e"
    # Use `production` mode to catch issues introduced by build optimizations.
    yarn e2e-prod
  travisFoldEnd "test.aio.e2e"

  # Test Firebase redirects
  travisFoldStart "test.aio.deployment-config"
    yarn deployment-config-test
  travisFoldEnd "test.aio.deployment-config"

  # Run unit tests for aio/aio-builds-setup
  travisFoldStart "test.aio.aio-builds-setup"
    ./aio-builds-setup/scripts/test.sh
  travisFoldEnd "test.aio.aio-builds-setup"
)
