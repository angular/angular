#!/usr/bin/env bash

set -eu -o pipefail

cd `dirname $0`

# Workaround https://github.com/yarnpkg/yarn/issues/2165
# Yarn will cache file://dist URIs and not update Angular code
readonly cache=.yarn_local_cache
function rm_cache {
  rm -rf $cache
}
rm_cache
mkdir $cache
trap rm_cache EXIT

# Workaround for https://github.com/yarnpkg/yarn/issues/2256
rm -f yarn.lock
yarn install --cache-folder ./$cache

echo "#################################"
echo "Running platform-server end to end tests"
echo "#################################"

# this is a workaround for resolving tsc-wrapped as the local version not available on npm
# tsc-wrapped is installed as a transitive dependency of compiler-cli
# compiler-cli needs to be installed while offline so that it doesn't try to look up tsc-wrapped version on npm
# it should instead use the version that is already installed in the project via package.json
yarn add --offline ../../../dist/packages-dist/compiler-cli --cache-folder ./$cache

yarn test || exit 1
