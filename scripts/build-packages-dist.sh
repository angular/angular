#!/usr/bin/env bash
# Build the dist/packages-dist directory in the same fashion as the legacy
# /build.sh script, by building the npm packages with Bazel and copying files.
# This is needed for scripts and tests which are not updated to the Bazel output
# layout (which always matches the input layout).
# Do not add new dependencies on this script, instead adapt scripts to use the
# new layout, and write new tests as Bazel targets.

set -u -e -o pipefail

cd "$(dirname "$0")"

# basedir is the workspace root
readonly basedir=$(pwd)/..
# We need to resolve the Bazel binary in the node modules because running Bazel
# through `yarn bazel` causes additional output that throws off command stdout.
readonly bazelBin=$(yarn bin)/bazel
readonly bin=$(${bazelBin} info bazel-bin)

function buildTargetPackages() {
  targets="$1"
  destPath="$2"
  compileMode="$3"
  desc="$4"

  echo "##################################"
  echo "scripts/build-packages-dist.sh:"
  echo "  building @angular/* npm packages"
  echo "  mode: ${desc}"
  echo "##################################"

  echo "$targets" | xargs ${bazelBin} build --define=compile=$compileMode

  [ -d "${basedir}/${destPath}" ] || mkdir -p $basedir/${destPath}

  dirs=`echo "$targets" | sed -e 's/\/\/packages\/\(.*\):npm_package/\1/'`

  for pkg in $dirs; do
    # Skip any that don't have an "npm_package" target
    srcDir="${bin}/packages/${pkg}/npm_package"
    destDir="${basedir}/${destPath}/${pkg}"
    if [ -d $srcDir ]; then
      echo "# Copy artifacts to ${destDir}"
      rm -rf $destDir
      cp -R $srcDir $destDir
      chmod -R u+w $destDir
    fi
  done
}

# Ideally these integration tests should run under bazel, and just list the npm
# packages in their deps[].
# Until then, we have to manually run bazel first to create the npm packages we
# want to test.
BAZEL_TARGETS=`${bazelBin} query --output=label 'attr("tags", "\[.*release-with-framework.*\]", //packages/...) intersect kind(".*_package", //packages/...)'`
buildTargetPackages "$BAZEL_TARGETS" "dist/packages-dist" "legacy" "Production"

# We don't use the ivy build in the integration tests, only when publishing
# snapshots.
# This logic matches what we use in the .circleci/config.yml file to short-
# circuit execution of the publish-packages job.
[[  "${CI_PULL_REQUEST-}" != "false"
    || "${CI_REPO_OWNER-}" != "angular"
    || "${CI_REPO_NAME-}" != "angular"
    || "${CI_BRANCH}" != "master"
]] && exit 0

buildTargetPackages "$BAZEL_TARGETS" "dist/packages-dist-ivy-aot" "aot" "Ivy AOT"
