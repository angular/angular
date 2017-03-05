#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh
cd ${PROJECT_ROOT}/aio


# Lint the code
travisFoldStart "test.aio.lint"
  yarn run lint
travisFoldEnd "test.aio.lint"

# Generate docs files
# TODO(i): why is this in 'test' phase and not in the 'build' phase?
travisFoldStart "test.aio.doc-gen"
  $(npm bin)/gulp docs
travisFoldEnd "test.aio.doc-gen"


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
