#!/usr/bin/env bash

set -e -o pipefail

# see https://circleci.com/docs/2.0/env-vars/#circleci-built-in-environment-variables
CI=${CI:-false}

cd "$(dirname "$0")"

# basedir is the workspace root
readonly basedir=$(pwd)/..
readonly bin=$(bazel info bazel-bin)

echo "#################################"
echo "Building @angular/* npm packages "
echo "#################################"

# Ideally these integration tests should run under bazel, and just list the npm
# packages in their deps[].
# Until then, we have to manually run bazel first to create the npm packages we
# want to test.
bazel query --output=label 'kind(.*_package, //packages/...)' \
  | xargs bazel build

# Allow this test to run even if dist/ doesn't exist yet.
# Under Bazel we don't need to create the dist folder to run the integration tests
[ -d "${basedir}/dist/packages-dist" ] || mkdir -p $basedir/dist/packages-dist
# Each package is a subdirectory of bazel-bin/packages/
for pkg in $(ls ${bin}/packages); do
  # Skip any that don't have an "npm_package" target
  if [ -d "${bin}/packages/${pkg}/npm_package" ]; then
    echo "# Copy artifacts to dist/packages-dist/${pkg}"
    rm -rf ${basedir}/dist/packages-dist/${pkg}
    cp -R ${bin}/packages/${pkg}/npm_package ${basedir}/dist/packages-dist/${pkg}
  fi
done

# Track payload size functions
# TODO(alexeagle): finish migrating these to buildsize.org
if $CI; then
  # We don't install this by default because it contains some broken Bazel setup
  # and also it's a very big dependency that we never use except when publishing
  # payload sizes on CI.
  yarn add -D firebase-tools@3.12.0
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

for testDir in $(ls | grep -v node_modules) ; do
  [[ -d "$testDir" ]] || continue
  echo "#################################"
  echo "Running integration test $testDir"
  echo "#################################"
  (
    cd $testDir
    rm -rf dist
    pwd
    yarn install --cache-folder ../$cache
    yarn test || exit 1
    # Track payload size for cli-hello-world and hello_world__closure and the render3 tests
    if [[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__closure ]] || [[ $testDir == hello_world__render3__closure ]] || [[ $testDir == hello_world__render3__rollup ]] || [[ $testDir == hello_world__render3__cli ]]; then
      if [[ $testDir == cli-hello-world ]] || [[ $testDir == hello_world__render3__cli ]]; then
        yarn build
      fi
      #if $CI; then
      #  trackPayloadSize "$testDir" "dist/*.js" true false "${basedir}/integration/_payload-limits.json"
      #fi
    fi
    # remove the temporary node modules directory to keep the source folder clean.
    rm -rf node_modules
  )
done

#if $CI; then
#  trackPayloadSize "umd" "../dist/packages-dist/*/bundles/*.umd.min.js" false false
#fi
