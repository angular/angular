#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# If the previous commands in the `script` section of .travis.yaml failed, then abort.
# The variable is not set in early stages of the build, so we default to 0 there.
# https://docs.travis-ci.com/user/environment-variables/
if [[ ${TRAVIS_TEST_RESULT=0} == 1 ]]; then
  exit 1;
fi


# Don't deploy Angular.io if we are running in a fork
if [[ ${TRAVIS_REPO_SLUG} != "angular/angular" ]]; then
  echo "Skipping deploy because this is not angular/angular."
  exit 0
fi


case ${CI_MODE} in
  aio)
    travisFoldStart "deploy.aio"
    (
      cd ${TRAVIS_BUILD_DIR}/aio
      yarn deploy-production
    )
    travisFoldEnd "deploy.aio"
    ;;
esac
