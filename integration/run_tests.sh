#!/usr/bin/env bash

set -e -o pipefail

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

for testDir in $(ls | grep -v node_modules) ; do
  [[ -d "$testDir" ]] || continue
  echo "#################################"
  echo "Running integration test $testDir"
  echo "#################################"
  (
    cd $testDir
    # Workaround for https://github.com/yarnpkg/yarn/issues/2256
    rm -f yarn.lock
    yarn install --cache-folder ../$cache

    # this is a workaround for resolving tsc-wrapped as the local version not available on npm
    # tsc-wrapped is installed as a transitive dependency of compiler-cli
    if [[ $testDir == "hello_world__closure" || $$testDir == "language_service_plugin" ]]; then
      # compiler-cli needs to be installed while offline so that it doesn't try to look up tsc-wrapped version on npm
      # it should instead use the version that is already installed in the project via package.json
      yarn add --offline ../../dist/packages-dist/compiler-cli --cache-folder ../$cache
    fi

    yarn test || exit 1
  )
done
