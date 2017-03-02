#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


travisFoldStart "test.unit.saucelabs"
  ./scripts/sauce/sauce_connect_block.sh
  SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`
  $(npm bin)/karma start ./karma-js.conf.js --single-run --browsers=${KARMA_JS_BROWSERS} --reporters internal-angular,saucelabs
travisFoldEnd "test.unit.saucelabs"
