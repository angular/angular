#!/bin/bash

# Script which always runs when the current Travis mode succeeds.
# Used to run the travis-after-modes script, which checks if all other modes finished.

# Go to the project root directory
cd $(dirname $0)/../..

# If not running as a PR, wait for all other travis modes to finish.
if [ "$TRAVIS_PULL_REQUEST" = "false" ] && $(npm bin)/travis-after-modes; then
  echo "All travis modes passed. Publishing the build artifacts..."
  ./scripts/release/publish-build-artifacts.sh
  ./scripts/release/publish-docs-content.sh
fi
