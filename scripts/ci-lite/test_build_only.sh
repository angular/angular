#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "build_only" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.js'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.buildPackages'

./build.sh

echo 'travis_fold:end:test.buildPackages'


echo 'travis_fold:end:test.js'
