#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


travisFoldStart "test.docs"
  cd ${PROJECT_ROOT}/aio
  $(npm bin)/gulp docs-test
travisFoldEnd "test.docs"
