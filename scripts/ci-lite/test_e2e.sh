#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "e2e" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.e2e'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.e2e.buildPackages'
./build.sh
echo 'travis_fold:end:test.e2e.buildPackages'


if [[ ${TRAVIS} ]]; then
  echo 'travis_fold:start:test.e2e.localChrome'
  sh -e /etc/init.d/xvfb start
  echo 'travis_fold:end:test.e2e.localChrome'
fi


echo 'travis_fold:start:test.e2e.integration'
./integration/run_tests.sh
#TODO(alexeagle): move offline_compiler_test to integration/
./scripts/ci-lite/offline_compiler_test.sh
echo 'travis_fold:end:test.e2e.integration'


echo 'travis_fold:start:test.e2e.apiAndCircularDeps'
$(npm bin)/gulp public-api:enforce
$(npm bin)/gulp check-cycle
echo 'travis_fold:end:test.e2e.apiAndCircularDeps'


echo 'travis_fold:start:test.e2e.protractor'
cd dist/
$(npm bin)/gulp serve &
$(npm bin)/gulp serve-examples &
cd ..
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-e2e.conf.js --bundles=true
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-examples-e2e.conf.js --bundles=true
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-perf.conf.js --bundles=true --dryrun
echo 'travis_fold:end:test.e2e.protractor'

echo 'travis_fold:end:test.e2e'


if [[ ${TRAVIS} ]]; then
  ./scripts/publish/publish-build-artifacts.sh
fi
