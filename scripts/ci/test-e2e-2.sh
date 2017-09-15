#!/usr/bin/env bash

# Second shard for the e2e tests. Balance it with runtime of test-e2e.sh

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


travisFoldStart "test.e2e.buildPackages"
  ./build.sh
travisFoldEnd "test.e2e.buildPackages"


travisFoldStart "test.e2e.integration"
  ./integration/run_tests.sh
travisFoldEnd "test.e2e.integration"


travisFoldStart "test.e2e.offlineCompiler"
  #TODO(alexeagle): move offline_compiler_test to integration/
  ${thisDir}/offline_compiler_test.sh
travisFoldEnd "test.e2e.offlineCompiler"

travisFoldStart "test.e2e.platform-server"
  ./packages/platform-server/integrationtest/run_tests.sh
travisFoldEnd "test.e2e.platform-server"
