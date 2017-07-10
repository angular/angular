#!/bin/bash

# Script that runs in every Travis CI container. The script is responsible for delegating
# to the different scripts that should run for specific Travis jobs in a build stage.

# The script should immediately exit if any command in the script fails.
set -e

# Go to project directory
cd $(dirname $0)/../..

if [[ -z "$TRAVIS" ]]; then
  echo "This script can only run inside of Travis build jobs."
  exit 1
fi

if [[ "${MODE}" ]]; then
  ./scripts/ci/travis-testing.sh
elif [[ "${DEPLOY_MODE}" ]]; then
  ./scripts/ci/travis-deploy.sh
fi
