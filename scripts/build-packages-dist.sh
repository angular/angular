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

echo "##################################"
echo "scripts/build-packages-dist.sh:"
echo "  building @angular/* npm packages"
echo "##################################"
# Ideally these integration tests should run under bazel, and just list the npm
# packages in their deps[].
# Until then, we have to manually run bazel first to create the npm packages we
# want to test.
bazel query --output=label 'kind(.*_package, //packages/...)' \
  | xargs bazel build
readonly bin=$(bazel info bazel-bin)

# Create the legacy dist/packages-dist folder
[ -d "${basedir}/dist/packages-dist" ] || mkdir -p $basedir/dist/packages-dist
# Each package is a subdirectory of bazel-bin/packages/
for pkg in $(ls ${bin}/packages); do
  # Skip any that don't have an "npm_package" target
  srcDir="${bin}/packages/${pkg}/npm_package"
  destDir="${basedir}/dist/packages-dist/${pkg}"
  if [ -d $srcDir ]; then
    echo "# Copy artifacts to ${destDir}"
    rm -rf $destDir
    cp -R $srcDir $destDir
    chmod -R u+w $destDir
  fi
done
