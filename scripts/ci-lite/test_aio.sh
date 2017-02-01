#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "aio" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.aio'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.aio.lint'

# Lint the code
cd "`dirname $0`/../../angular.io"
yarn run lint
cd -

echo 'travis_fold:end:test.aio.lint'


echo 'travis_fold:start:test.aio.localChromeSetup'

# Start local Chrome
if [[ ${TRAVIS} ]]; then
  sh -e /etc/init.d/xvfb start
fi

echo 'travis_fold:end:test.aio.localChromeSetup'


echo 'travis_fold:start:test.aio.unit'

# Run unit tests
cd "`dirname $0`/../../angular.io"
yarn test -- --single-run
cd -

echo 'travis_fold:end:test.aio.unit'


echo 'travis_fold:start:test.aio.e2e'

# Run e2e tests
cd "`dirname $0`/../../angular.io"
yarn start &
yarn run e2e
cd -

echo 'travis_fold:end:test.aio.e2e'


echo 'travis_fold:end:test.aio'
