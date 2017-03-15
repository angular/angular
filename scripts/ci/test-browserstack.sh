#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


travisFoldStart "test.unit.browserstack"
  ./scripts/browserstack/waitfor_tunnel.sh
  export BROWSER_STACK_ACCESS_KEY=`echo $BROWSER_STACK_ACCESS_KEY | rev`
  $(npm bin)/karma start ./karma-js.conf.js --single-run --browsers=${KARMA_JS_BROWSERS}
travisFoldEnd "test.unit.browserstack"
