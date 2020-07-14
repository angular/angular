#!/usr/bin/env bash

##### Test Debug Utility #####
##############################

# Use this script to run the ngcc integration test locally
# in isolation from the other integration tests.
# This is useful when debugging the ngcc code-base.

set -u -e -o pipefail

cd "$(dirname "$0")"

node $(pwd)/../../scripts/build/build-packages-dist.js

# Workaround https://github.com/yarnpkg/yarn/issues/2165
# Yarn will cache file://dist URIs and not update Angular code
readonly cache=../.yarn_local_cache
function rm_cache {
  rm -rf $cache
}
rm_cache
mkdir $cache
trap rm_cache EXIT

rm -rf dist
rm -rf node_modules
yarn install --cache-folder $cache
yarn test
