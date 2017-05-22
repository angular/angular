#!/bin/bash

# Script which always runs when the current Travis mode succeeds.
# Used to run the travis-after-modes script, which checks if all other modes finished.

# Go to the project root directory
cd $(dirname $0)/../..

# If not running as a PR, wait for all other travis modes to finish.
if [ "$TRAVIS_PULL_REQUEST" = "false" ] && $(npm bin)/travis-after-modes; then
  echo "All travis modes passed. Publishing the build artifacts..."
  echo ""

  # Build Material, CDK and the docs before publishing artifacts
  $(npm bin)/gulp material:build-release:clean
  $(npm bin)/gulp material-examples:build-release
  $(npm bin)/gulp docs

  # Run publishing of artifacts in parallel. This is possible because the output has been built before.
  ./scripts/release/publish-build-artifacts.sh --no-build &
  ./scripts/release/publish-docs-content.sh --no-build &

  # Deploy the screenshot functions for each push build.
  ./scripts/release/deploy-screenshot-functions.sh &

  wait
#fi
