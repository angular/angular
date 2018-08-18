#!/usr/bin/env bash

set -u -e -o pipefail

# see https://circleci.com/docs/2.0/env-vars/#circleci-built-in-environment-variables
CI=${CI:-false}

cd "$(dirname "$0")"

# basedir is the workspace root
readonly basedir=$(pwd)/..

# Track payload size functions
if $CI; then
  # We don't install this by default because it contains some broken Bazel setup
  # and also it's a very big dependency that we never use except when publishing
  # payload sizes on CI.
  yarn add --silent -D firebase-tools@3.12.0
  source ${basedir}/scripts/ci/payload-size.sh
fi

# Workaround https://github.com/yarnpkg/yarn/issues/2165
# Yarn will cache file://dist URIs and not update Angular code
readonly cache=.yarn_local_cache
function rm_cache {
  rm -rf $cache
}
rm_cache
mkdir $cache
trap rm_cache EXIT

for testDir in $(ls | grep -v node_modules); do
  [[ -d "$testDir" ]] || continue

  # Track payload size for cli-hello-world and hello_world__closure and the render3 tests
  if [[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__closure ]] || [[ $testDir == hello_world__render3__closure ]] || [[ $testDir == hello_world__render3__rollup ]] || [[ $testDir == hello_world__render3__cli ]]; then
    if [[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__render3__cli ]]; then
      doBuild='--build'
    fi
    #if $CI; then
      # doTrack='--track'
    #fi
  fi

  ./run_test.sh ${doBuild-} ${doTrack-} --cache $cache $testDir
done

#if $CI; then
#  trackPayloadSize "umd" "../dist/packages-dist/*/bundles/*.umd.min.js" false false
#fi
