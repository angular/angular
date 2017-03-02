#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


travisFoldStart "test.e2e.buildPackages"
  ./build.sh
travisFoldEnd "test.e2e.buildPackages"


if [[ ${TRAVIS} ]]; then
  travisFoldStart "test.e2e.xvfb-start"
    sh -e /etc/init.d/xvfb start
  travisFoldEnd "test.e2e.xvfb-start"
fi


travisFoldStart "test.e2e.integration"
  ./integration/run_tests.sh
travisFoldEnd "test.e2e.integration"


travisFoldStart "test.e2e.offlineCompiler"
  #TODO(alexeagle): move offline_compiler_test to integration/
  ./scripts/ci-lite/offline_compiler_test.sh
travisFoldEnd "test.e2e.offlineCompiler"


travisFoldStart "test.e2e.publicApi"
  $(npm bin)/gulp public-api:enforce
travisFoldEnd "test.e2e.publicApi"


travisFoldStart "test.e2e.check-cycle"
  $(npm bin)/gulp check-cycle
travisFoldEnd "test.e2e.check-cycle"


# Serve files for e2e tests
(
  cd dist/
  $(npm bin)/gulp serve &
  $(npm bin)/gulp serve-examples &
)

travisFoldStart "test.e2e.protractor-e2e"
  NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-e2e.conf.js --bundles=true
travisFoldEnd "test.e2e.protractor-e2e"
travisFoldStart "test.e2e.protractor-examples-e2e"
  NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-examples-e2e.conf.js --bundles=true
travisFoldEnd "test.e2e.protractor-examples-e2e"
travisFoldStart "test.e2e.protractor-perf"
  NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-perf.conf.js --bundles=true --dryrun
travisFoldEnd "test.e2e.protractor-perf"
