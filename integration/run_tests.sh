#!/usr/bin/env bash

set -u -e -o pipefail

# see https://circleci.com/docs/2.0/env-vars/#circleci-built-in-environment-variables
CI=${CI:-false}

cd "$(dirname "$0")"

# basedir is the workspace root
readonly basedir=$(pwd)/..

# When running on the CI, we track the payload size of various integration output files. Also
# we shard tests across multiple CI job instances. The script needs to be run with a shard index
# and the maximum amount of shards available for the integration tests on the CI.
# For example: "./run_tests.sh {SHARD_INDEX} {MAX_SHARDS}".
if $CI; then
  source ${basedir}/scripts/ci/payload-size.sh

  SHARD_INDEX=${1:?"No shard index has been specified."}
  MAX_SHARDS=${2:?"The maximum amount of shards has not been specified."}

  # Determines the tests that need to be run for this shard index.
  TEST_DIRS=$(node ./get-sharded-tests.js --shardIndex ${SHARD_INDEX} --maxShards ${MAX_SHARDS})

  # NB: we don't run build-packages-dist.sh because we expect that it was done
  # by an earlier job in the CircleCI workflow.
else
  # Not on CircleCI so let's build the packages-dist directory.
  # This should be fast on incremental re-build.
  ${basedir}/scripts/build-packages-dist.sh

  # If we aren't running on CircleCI, we do not shard tests because this would be the job of
  # Bazel eventually. For now, we just run all tests sequentially when running locally.
  TEST_DIRS=$(ls | grep -v node_modules)
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

for testDir in ${TEST_DIRS}; do
  [[ -d "$testDir" ]] || continue
  echo "#################################"
  echo "Running integration test $testDir"
  echo "#################################"
  (
    cd $testDir
    rm -rf dist

    yarn install --cache-folder ../$cache
    yarn test || exit 1

    # Track payload size for cli-hello-world, cli-hello-world-ivy-minimal, cli-hello-world-ivy-compat and
    # hello_world__closure
    if $CI && ([[ $testDir == cli-hello-world ]] || [[ $testDir == cli-hello-world-ivy-minimal ]] || [[ $testDir == cli-hello-world-ivy-compat ]] || [[ $testDir == hello_world__closure ]]); then
      if ([[ $testDir == cli-hello-world ]] || [[ $testDir == cli-hello-world-ivy-minimal ]] || [[ $testDir == cli-hello-world-ivy-compat ]]); then
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
