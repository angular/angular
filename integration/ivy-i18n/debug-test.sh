#!/usr/bin/env bash

##### Test Debug Utility #####
##############################

# Use this script to run the ngcc integration test locally
# in isolation from the other integration tests.
# This is useful when debugging the ngcc code-base.

set -u -e -o pipefail

cd "$(dirname "$0")"

# Go to the project directory and build the release packages.
(cd $(pwd)/../../ && yarn build)

rm -rf dist
rm -rf node_modules
yarn install
yarn test
