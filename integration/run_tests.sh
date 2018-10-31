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
  yarn add --silent -D firebase-tools@5.1.1
  source ${basedir}/scripts/ci/payload-size.sh

  # NB: we don't run build-packages-dist.sh because we expect that it was done
  # by an earlier job in the CircleCI workflow.
else
  # Not on CircleCI so let's build the packages-dist directory.
  # This should be fast on incremental re-build.
  ${basedir}/scripts/build-packages-dist.sh
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

for testDir in $(ls | grep -v node_modules) ; do
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
    if $CI && ([[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__closure ]]); then
      if [[ $testDir == cli-hello-world ]]; then
        yarn build
      fi

      trackPayloadSize "$testDir" "dist/*.js" true false "${basedir}/integration/_payload-limits.json"
    fi

    # remove the temporary node modules directory to keep the source folder clean.
    rm -rf node_modules
  )
done

if $CI; then
  trackPayloadSize "umd" "../dist/packages-dist/*/bundles/*.umd.min.js" false false
fi
