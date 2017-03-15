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
    yarn run lint
  travisFoldEnd "test.aio.lint"


  # Start xvfb for local Chrome used for testing
  if [[ ${TRAVIS} ]]; then
    travisFoldStart "test.aio.xvfb-start"
      sh -e /etc/init.d/xvfb start
    travisFoldEnd "test.aio.xvfb-start"
  fi


  # Run unit tests
  travisFoldStart "test.aio.unit"
    yarn test -- --single-run
  travisFoldEnd "test.aio.unit"


  # Run e2e tests
  travisFoldStart "test.aio.e2e"
    yarn run e2e
  travisFoldEnd "test.aio.e2e"


  # Run unit tests for aio/aio-builds-setup
  travisFoldStart "test.aio.aio-builds-setup"
    ./aio-builds-setup/scripts/test.sh
  travisFoldEnd "test.aio.aio-builds-setup"
)
