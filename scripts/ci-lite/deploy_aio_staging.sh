#!/usr/bin/env bash

set -ex -o pipefail

# Only deploy if this Travis job is for the upstream master branch
if [[ ! ${TRAVIS} || ${CI_MODE} != "aio" || ${TRAVIS_PULL_REQUEST} || ${TRAVIS_BRANCH} != "master" ]]; then
  echo 0;
fi


echo 'travis_fold:start:aio.deploy'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:aio.deploy.staging'

# Deploy angular.io to staging
cd "`dirname $0`/../../angular.io"
yarn run deploy-staging
cd -

echo 'travis_fold:end:aio.deploy.staging'


echo 'travis_fold:end:aio.deploy'
