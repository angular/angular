#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:TEST'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

./scripts/ci-lite/test_js.sh
./scripts/ci-lite/test_e2e.sh

# Only execute browser tests on the angular/angular repo
if [[ ${TRAVIS} && ${TRAVIS_REPO_SLUG} != "angular/anguar" ]]; then
  ./scripts/ci-lite/test_saucelabs.sh
  ./scripts/ci-lite/test_browserstack.sh
fi

echo 'travis_fold:end:test-browser'

echo 'travis_fold:end:TEST'
