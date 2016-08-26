#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "js" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.js'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.unit'
if [[ ${TRAVIS} ]]; then
  sh -e /etc/init.d/xvfb start
fi
bazel --bazelrc=scripts/ci-lite/bazelrc test \
    :tool_tests :jasmine_tests :karma_test :router_karma_test \
    --test_env=DISPLAY \
    --test_env=CHROME_BIN \
    --test_env=CI_MODE \
    --test_env=TRAVIS \
    --test_env=TRAVIS_BUILD_NUMBER \
    --test_env=TRAVIS_BUILD_ID \
    "--test_arg=--browsers=${KARMA_JS_BROWSERS}"
echo 'travis_fold:start:test.unit'

echo 'travis_fold:end:test.js'
