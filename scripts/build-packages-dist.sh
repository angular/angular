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
readonly bin=$(bazel info bazel-bin)

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

  echo "$targets" | xargs bazel build --define=compile=$compileMode

  [ -d "${basedir}/${destPath}" ] || mkdir -p $basedir/${destPath}

  dirs=`echo "$targets" | grep '//packages/[^/]*:npm_package' | sed -e 's/\/\/packages\/\(.*\):npm_package/\1/'`

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
LEGACY_TARGETS=`bazel query --output=label 'kind(.*_package, //packages/...)'`
buildTargetPackages "$LEGACY_TARGETS" "dist/packages-dist" "legacy" "Production"

# We don't use the ivy build in the integration tests, only when publishing
# snapshots.
# This logic matches what we use in the .circleci/config.yml file to short-
# circuit execution of the publish-packages job.
[[  -v CIRCLE_PR_NUMBER
    || "$CIRCLE_PROJECT_USERNAME" != "angular"
    || "$CIRCLE_PROJECT_REPONAME" != "angular"
]] && exit 0

IVY_JIT_TARGETS=`bazel query --output=label 'attr("tags", "\[.*ivy-jit.*\]", //packages/...) intersect kind(".*_package", //packages/...)'`
IVY_LOCAL_TARGETS=`bazel query --output=label 'attr("tags", "\[.*ivy-local.*\]", //packages/...) intersect kind(".*_package", //packages/...)'`
buildTargetPackages "$IVY_JIT_TARGETS" "dist/packages-dist-ivy-jit" "jit" "Ivy JIT"
buildTargetPackages "$IVY_LOCAL_TARGETS" "dist/packages-dist-ivy-local" "local" "Ivy AOT"

