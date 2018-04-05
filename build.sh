#!/usr/bin/env bash

set -u -e -o pipefail
readonly basedir=$(dirname $0)
readonly bin=$(bazel info bazel-bin)

echo "###################################"
echo "# Building packages with Bazel"
echo "#   Use build.legacy.sh for previous behavior and file an issue explaining why that was needed."
echo "###################################"

bazel query --output=label 'kind(".*_package", //packages/...)' \
    | xargs bazel build

# For backwards compat with /integration/* tests, publishing snapshots, etc
# we symlink the bazel outputs to the same locations as build.legacy.sh
[ -d "${basedir}/dist/packages-dist" ] || mkdir -p $basedir/dist/packages-dist

for pkg in $(ls ${bin}/packages); do
  if [ -d "${bin}/packages/${pkg}/npm_package" ]; then
    if [ ! -h ${basedir}/dist/packages-dist/${pkg} ]; then
      ln -s ${bin}/packages/${pkg}/npm_package ${basedir}/dist/packages-dist/${pkg}
    fi
  fi
done
