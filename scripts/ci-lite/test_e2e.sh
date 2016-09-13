#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "e2e" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.js'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.buildPackages'

./build.sh

echo 'travis_fold:end:test.buildPackages'


./scripts/ci-lite/offline_compiler_test.sh
./tools/typings-test/test.sh
$(npm bin)/gulp public-api:enforce

$(npm bin)/gulp check-cycle

echo 'travis_fold:start:test.e2e.localChrome'
cd dist/
$(npm bin)/gulp serve &
$(npm bin)/gulp serve-examples &
cd ..
if [[ ${TRAVIS} ]]; then
  sh -e /etc/init.d/xvfb start
fi
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-e2e.conf.js --bundles=true
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-examples-e2e.conf.js --bundles=true
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-perf.conf.js --bundles=true --dryrun
echo 'travis_fold:end:test.e2e.localChrome'

echo 'travis_fold:end:test.js'

if [[ ${TRAVIS} ]]; then
  ./scripts/publish/publish-build-artifacts.sh
fi
