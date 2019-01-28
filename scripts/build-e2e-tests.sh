#!/usr/bin/env bash

# Legacy bash script that builds the e2e tests partially using Bazel and old Bash build scripts.
# These scripts will be removed in the future and should be replaced by Bazel's test command.

# Immediately exit if any command failed.
set -e

# Go to project directory.
cd $(dirname ${0})/../

BAZEL=`yarn bin bazel`
BAZEL_BIN_DIR=`${BAZEL} info bazel-bin`

if [[ ! ${*} == *--use-existing-packages-dist* ]]; then
  # Build all Angular release packages (this does not include //packages/benchpress)
  ./scripts/build-packages-dist.sh
fi

# Build the "@angular/benchpress" package which is required for running e2e perf tests.
yarn bazel build //packages/benchpress:npm_package

# Copy the NPM package output of the benchpress package to the "packages-dist" directory.
# This simplifies our path mappings for tests depending on these built packages.
mkdir dist/packages-dist/benchpress
cp -R ${BAZEL_BIN_DIR}/packages/benchpress/npm_package/* dist/packages-dist/benchpress

# Symlinks the Bazel "packages-dist" output to "dist/all/@angular" so that it can be used in
# combination with "$NODE_PATH" for a proper module resolution. Note that this is outdated
# and shouldn't be necessary if we run tests using Bazel in the future.
mkdir -p ./dist/all
(cd ./dist/all; ln -s ../packages-dist/ "@angular")

# Build the modules which contain the playground and benchmark e2e tests. These
# can be served by running "gulp serve".
./modules/build.sh
