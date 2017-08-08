#!/bin/bash

# Script that runs in the deploy stage after the testing stage of Travis passed.
# Build artifacts and docs content will be published to different repositories.

# The script should immediately exit if any command in the script fails.
set -e

# Go to the project root directory
cd $(dirname $0)/../..

# If the current Travis job is triggered by a pull request skip the deployment.
# This check is necessary because Travis still tries to run the deploy build-stage for
# pull requests.
if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "Build artifacts and docs content will only be deployed in Travis push builds."
  exit 0;
fi

echo ""
echo "Starting the deployment script. Running mode: ${DEPLOY_MODE}"
echo ""

if [[ "${DEPLOY_MODE}" == "build-artifacts" ]]; then
  ./scripts/deploy/publish-build-artifacts.sh
fi

if [[ "${DEPLOY_MODE}" == "docs-content" ]]; then
  ./scripts/deploy/publish-docs-content.sh
fi

if [[ "${DEPLOY_MODE}" == "screenshot-tool" ]]; then
  ./scripts/deploy/deploy-screenshot-tool.sh
fi

if [[ "${DEPLOY_MODE}" == "dashboard" ]]; then
  ./scripts/deploy/deploy-dashboard.sh
fi
