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


# TODO: Chrome crashes with the following error:
#   E/launcher - unknown error: Chrome failed to start: crashed
#   (Driver info: chromedriver=2.26.436382 (70eb799287ce4c2208441fc057053a5b07ceabac),platform=Linux 4.8.12-040812-generic x86_64)
# echo 'travis_fold:start:test.aio.e2e'
#
# # Run e2e tests
# cd "`dirname $0`/../../angular.io"
# yarn start &
# yarn run e2e
# cd -
#
# echo 'travis_fold:end:test.aio.e2e'


echo 'travis_fold:end:test.aio'
