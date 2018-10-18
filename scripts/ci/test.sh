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


case ${CI_MODE} in
  js)
    ${thisDir}/test-js.sh
    ;;
  e2e)
    ${thisDir}/test-e2e.sh
    ;;
  saucelabs_required)
    ${thisDir}/test-saucelabs.sh
    ;;
  browserstack_required)
    ${thisDir}/test-browserstack.sh
    ;;
  saucelabs_optional)
    ${thisDir}/test-saucelabs.sh
    ;;
  browserstack_optional)
    ${thisDir}/test-browserstack.sh
    ;;
esac
