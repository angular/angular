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

# No build needed for bazel or aio docs tests
if [[ ${CI_MODE:-} == "bazel" ]]; then
  exit 0;
fi

travisFoldStart "tsc all"
  $(npm bin)/tsc -p packages
  $(npm bin)/tsc -p packages/examples
  $(npm bin)/tsc -p modules
travisFoldEnd "tsc all"
