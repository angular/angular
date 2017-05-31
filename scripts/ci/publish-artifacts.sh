#!/bin/bash

# Script that runs after the testing stage of Travis passed.
# Build artifacts and docs content will be published to different repositories.

# Go to the project root directory
cd $(dirname $0)/../..

if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "Build artifacts and docs content will only be deployed in Travis push builds."
  exit 0;
fi

echo "Starting to publish the build artifacts and docs content..."
echo ""

# Build Material, CDK and the docs before publishing artifacts
$(npm bin)/gulp cdk:build-release:clean
$(npm bin)/gulp material:build-release
$(npm bin)/gulp material-examples:build-release
$(npm bin)/gulp docs

# Run publishing of artifacts in parallel.
# This is possible because the output has been built before.
./scripts/deploy/publish-build-artifacts.sh --no-build &
./scripts/deploy/publish-docs-content.sh --no-build &

# Deploy the screenshot and dashboard functions for each push build.
./scripts/deploy/deploy-screenshot-functions.sh &
./scripts/deploy/deploy-dashboard-functions.sh &

wait
