#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "browserstack_required" && ${CI_MODE} != "browserstack_optional" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test_browserstack'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


./scripts/browserstack/waitfor_tunnel.sh
export BROWSER_STACK_ACCESS_KEY=`echo $BROWSER_STACK_ACCESS_KEY | rev`

for target in :karma_test; do
  bazel --bazelrc=scripts/ci-lite/bazelrc run \
      $target -- "--browsers=${KARMA_JS_BROWSERS}"
done


echo 'travis_fold:end:test_browserstack'
