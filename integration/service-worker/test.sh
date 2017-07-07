#!/bin/bash
# Runs the service worker end to end test

# Print out commands and fail if any of them fail.
set -e -x

# Firstly, clean up
rm -rf dist dist-e2e

# Next, compile the testing harness.
ng build --prod

# Copy the testing service worker into dist/
cp node_modules/@angular/service-worker/bundles/worker-test.js dist/

# Compile the e2e tests themselves (including the testing HTTP server)
$(npm bin)/tsc -p tsconfig-e2e.json

# Actually execute the test
$(npm bin)/protractor ./protractor.config.js
