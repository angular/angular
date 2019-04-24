#!/bin/bash

# Exit if any of the builds fails
set -e

# Source directories for packages to build with bazel and copy into dist/
# We use the bazel tag "publish" as a marker for rules we care about here.
packages=$(bazel query --output=package 'kind(ng_package, ...)' | xargs -n1 basename)

# The bazel-bin directory where the bazel output is written
bazel_bin="$(bazel info bazel-bin)"

# The dist/ directory where we want to copy the final result. Clear it out to avoid
# any artifacts from earlier builds being retained.
packages_dist="./dist/bazel-packages"
rm -rf ${packages_dist}
mkdir -p ${packages_dist}

for p in ${packages[@]}
do
  bazel build src/${p}:npm_package
  # Copy without preserving the read-only mode from bazel so that we can make final modifications
  # to the generated package.
  mkdir -p ${packages_dist}/${p}
  cp -r --no-preserve=mode ${bazel_bin}/src/${p}/npm_package/* ${packages_dist}/${p}
done

# Update the root @angular/material metadata file to re-export metadata from each entry-point.
./scripts/bazel/update-material-metadata-reexports.js

# Create a tgz for each package with `npm pack`. Change directory in a subshell because
# `npm pack` always outputs to the current working directory.
(cd ${packages_dist} ; find . -maxdepth 1 -mindepth 1 -type d | xargs npm pack)
