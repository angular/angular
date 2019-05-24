#!/usr/bin/env bash
set -u -e -o pipefail

# This script runs unit tests from angular/material2.

# Save the dir for the root of the Angular repo.
angular_dir=$(pwd)

# Switch into Material directory.
cd ${MATERIAL_REPO_TMP_DIR}

# Install this version of Angular into the freshly cloned repo.
rm -rf ./node_modules/@angular/*
cp -r ${angular_dir}/dist/packages-dist-ivy-aot/* ./node_modules/@angular/

# The angular/material2 CI sets TEST_PLATFORM to either "local", "saucelabs", or "browserstack".
# For angular/angular, we only want to run the "local" tests.
export TEST_PLATFORM=local

# Append the test blocklist into angular/material2's karma-test-shim.js.
# This filters out known-failing tests because the goal is to prevent regressions.
cat ${angular_dir}/tools/material-ci/angular_material_test_blocklist.js >> ./test/karma-test-shim.js

# Now actually run the tests.
yarn gulp test:single-run
