#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "aio" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.aio'

# Setup environment
cd `dirname $0`
source ./env.sh


echo 'travis_fold:start:test.aio.lint'
# Lint the code
cd ../../aio
yarn run lint
cd -
echo 'travis_fold:end:test.aio.lint'


echo 'travis_fold:start:test.aio.doc-gen'
# Lint the code
cd ../../aio
$(npm bin)/gulp docs
cd -
echo 'travis_fold:end:test.aio.doc-gen'


echo 'travis_fold:start:test.aio.localChromeSetup'

# Start local Chrome
if [[ ${TRAVIS} ]]; then
  sh -e /etc/init.d/xvfb start
fi

echo 'travis_fold:end:test.aio.localChromeSetup'


echo 'travis_fold:start:test.aio.unit'
# Run unit tests
cd ../../aio
yarn test -- --single-run
cd -
echo 'travis_fold:end:test.aio.unit'

echo 'travis_fold:start:test.aio.e2e'
# Run e2e tests
cd ../../aio
yarn start &
yarn run e2e
cd -
echo 'travis_fold:end:test.aio.e2e'

echo 'travis_fold:end:test.aio'
