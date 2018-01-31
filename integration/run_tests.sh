#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

readonly thisDir=$(cd $(dirname $0); pwd)

# Track payload size functions
source ../scripts/ci/payload-size.sh

# Workaround https://github.com/yarnpkg/yarn/issues/2165
# Yarn will cache file://dist URIs and not update Angular code
readonly cache=.yarn_local_cache
function rm_cache {
  rm -rf $cache
}
rm_cache
mkdir $cache
trap rm_cache EXIT

for testDir in $(ls | grep -Ev 'node_modules|render3') ; do
  [[ -d "$testDir" ]] || continue
  echo "#################################"
  echo "Running integration test $testDir"
  echo "#################################"
  (
    cd $testDir
    rm -rf dist
    yarn install --cache-folder ../$cache
    yarn test || exit 1
    # Track payload size for cli-hello-world and hello_world__closure and the render3 tests
    if [[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__closure ]] || [[ $testDir == hello_world__render3__closure ]] || [[ $testDir == hello_world__render3__rollup ]] || [[ $testDir == hello_world__render3__cli ]]; then
      if [[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__render3__cli ]]; then
        yarn build
      fi
      if [[ -v TRAVIS ]]; then
        trackPayloadSize "$testDir" "dist/*.js" true false "${thisDir}/_payload-limits.json"
      fi
    fi
    if [[ -v TRAVIS ]]; then
      # remove the temporary node modules directory to save space.
      rm -rf node_modules
    fi
  )
done

if [[ -v TRAVIS ]]; then
  trackPayloadSize "umd" "../dist/packages-dist/*/bundles/*.umd.min.js" false false
fi
