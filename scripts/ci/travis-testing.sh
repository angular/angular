#!/bin/bash

# Script that runs in the testing build stage of Travis and is responsible for testing
# the project in different Travis jobs of the current build stage.

# The script should immediately exit if any command in the script fails.
set -e

echo ""
echo "Building sources and running tests. Running mode: ${MODE}"
echo ""

# Go to project dir
cd $(dirname $0)/../..

# Include sources.
source scripts/ci/sources/mode.sh
source scripts/ci/sources/tunnel.sh

# Get commit diff
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
  fileDiff=$(git diff --name-only $TRAVIS_COMMIT_RANGE)
else
  fileDiff=$(git diff --name-only $TRAVIS_BRANCH...HEAD)
fi

# Check if tests can be skipped
if [[ ${fileDiff} =~ ^(.*\.md\s*)*$ ]] && (is_e2e || is_unit); then
  echo "Skipping e2e and unit tests since only markdown files changed"
  exit 0
fi

start_tunnel
wait_for_tunnel

if is_lint; then
  $(npm bin)/gulp ci:lint
elif is_e2e; then
  $(npm bin)/gulp ci:e2e
elif is_aot; then
  $(npm bin)/gulp ci:aot
elif is_payload; then
  $(npm bin)/gulp ci:payload
elif is_closure_compiler; then
  ./scripts/closure-compiler/build-devapp-bundle.sh
elif is_unit; then
  $(npm bin)/gulp ci:test
elif is_prerender; then
  $(npm bin)/gulp ci:prerender
fi

# Upload coverage results if those are present.
if [ -f dist/coverage/coverage-summary.json ]; then
  $(npm bin)/gulp ci:coverage
fi

teardown_tunnel
