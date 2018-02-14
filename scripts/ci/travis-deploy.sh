#!/bin/bash

# Script that runs in the deploy stage after the testing stage of Travis passed.
# Build artifacts and docs content will be published to different repositories.

# The script should immediately exit if any command in the script fails.
set -e

# Go to the project root directory
cd $(dirname $0)/../..

# Load the retry-call utility function.
source scripts/retry-call.sh

# Variable the specifies how often the deploy script should be invoked if it fails.
DEPLOY_RETRIES=1

echo ""
echo "Starting the deployment script. Running mode: ${DEPLOY_MODE}"
echo ""

if [[ "${DEPLOY_MODE}" == "screenshot-tool" ]]; then
  retryCall ${DEPLOY_RETRIES} ./scripts/deploy/deploy-screenshot-tool.sh
elif [[ "${DEPLOY_MODE}" == "dashboard" ]]; then
  retryCall ${DEPLOY_RETRIES} ./scripts/deploy/deploy-dashboard.sh
elif [[ "${DEPLOY_MODE}" == "build-artifacts" ]]; then
  retryCall ${DEPLOY_RETRIES} ./scripts/deploy/publish-build-artifacts.sh
elif [[ "${DEPLOY_MODE}" == "docs-content" ]]; then
  retryCall ${DEPLOY_RETRIES} ./scripts/deploy/publish-docs-content.sh
fi
