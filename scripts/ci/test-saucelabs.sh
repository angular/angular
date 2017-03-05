#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


travisFoldStart "test.unit.saucelabs"
  ./scripts/sauce/sauce_connect_block.sh
  SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`
  $(npm bin)/karma start ./karma-js.conf.js --single-run --browsers=${KARMA_JS_BROWSERS} --reporters internal-angular,saucelabs
travisFoldEnd "test.unit.saucelabs"
