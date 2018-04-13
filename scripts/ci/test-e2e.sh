#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


travisFoldStart "test.e2e.buildPackages"
  ./build.sh
travisFoldEnd "test.e2e.buildPackages"

travisFoldStart "test.e2e.check-cycle"
  $(npm bin)/gulp check-cycle
travisFoldEnd "test.e2e.check-cycle"

# Serve files for e2e tests
(
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

# TODO(i): temporarily disable this test because we don't have rxjs backwards compatibility package
#   and cdk+material are not yet compatible with rxjs v6
#   uncomment when we have cdk and material releases compatible with rxjs v6
#travisFoldStart "test.e2e.offlineCompiler"
#  #TODO(alexeagle): move offline_compiler_test to integration/
#  ${thisDir}/offline_compiler_test.sh
#travisFoldEnd "test.e2e.offlineCompiler"

travisFoldStart "test.e2e.source-maps"
  ./node_modules/.bin/gulp source-map-test
travisFoldEnd "test.e2e.source-maps"
