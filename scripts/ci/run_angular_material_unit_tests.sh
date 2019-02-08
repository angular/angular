#!/usr/bin/env bash
set -u -e -o pipefail


# This script runs unit tests from angular/material2.

# Save the dir for the root of the Angular repo.
angular_dir=$(pwd)

# Clone the angular/material2 repo into tmp so we can run the tests from there.
# We specifically use /tmp here because we want the cloned repo to be completely
# isolated from angular/angular in order to avoid any bad interactions between their
# separate build setups. Also note that this is using the ivy-2019 branch, which has
# previously been set up to work with ivy.
cd /tmp
rm -rf /tmp/material2
git clone --depth 1 --branch ivy-2019 https://github.com/angular/material2.git

# Install dependencies for the freshly cloned repo.
cd /tmp/material2
yarn install --frozen-lockfile --non-interactive # TODO: cache

# Install this version of Angular into the freshly cloned repo.
rm -rf /tmp/material2/node_modules/@angular/*
cp -r ${angular_dir}/dist/packages-dist-ivy-aot/* /tmp/material2/node_modules/@angular/

# The angular/material2 CI sets TEST_PLATFORM to either local, saucelabs, or browserstack.
# For angular/angular, we only want to run the local tests.
export TEST_PLATFORM=local

# Append the test blocklist into angular/material2's karma-test-shim.js.
# This filters out known-failing tests because the goal is to prevent regressions.
cat ${angular_dir}/tools/material-ci/angular_material_test_blocklist.js >> /tmp/material2/test/karma-test-shim.js

# Now actually run the tests.
yarn gulp test:single-run
