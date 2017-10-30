#!/bin/bash

# Script that runs in the deploy stage after the testing stage of Travis passed.
# Build artifacts and docs content will be published to different repositories.

# The script should immediately exit if any command in the script fails.
set -e

# Go to the project root directory
cd $(dirname $0)/../..

# Load the retry-call utility function.
source scripts/retry-call.sh

# If the current Travis job is triggered by a pull request skip the deployment.
# This check is necessary because Travis still tries to run the deploy build-stage for
# pull requests.
if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  echo "Build artifacts and docs content will only be deployed in Travis push builds."
  exit 0;
fi

# Variable the specifies how often the deploy script should be invoked if it fails.
DEPLOY_RETRIES=1

echo ""
echo "Starting the deployment script. Running mode: ${DEPLOY_MODE}"
echo ""

# Deployment of the screenshot tool or dashboard should happen inside of a Cronjob.
# For example, always deploying the screenshot functions on a per-commit base might cause problems
# with the screenshot tests, because the functions can be non-responsive for a few seconds.
if [[ "${TRAVIS_EVENT_TYPE}" == "cron" ]]; then
  if [[ "${DEPLOY_MODE}" == "screenshot-tool" ]]; then
    retryCall ${DEPLOY_RETRIES} ./scripts/deploy/deploy-screenshot-tool.sh
  elif [[ "${DEPLOY_MODE}" == "dashboard" ]]; then
    retryCall ${DEPLOY_RETRIES} ./scripts/deploy/deploy-dashboard.sh
  else
    echo "Docs content and build artifacts won't be published in Travis cronjobs."
  fi

# Deployment of the build artifacts and docs-content should only happen on a per-commit base.
# The target is to provide build artifacts in the GitHub repository for every commit.
else
  if [[ "${DEPLOY_MODE}" == "build-artifacts" ]]; then
    retryCall ${DEPLOY_RETRIES} ./scripts/deploy/publish-build-artifacts.sh
  elif [[ "${DEPLOY_MODE}" == "docs-content" ]]; then
    retryCall ${DEPLOY_RETRIES} ./scripts/deploy/publish-docs-content.sh
  else
    echo "The dashboard and screenshot-tool will only be deployed in Travis cronjobs."
  fi
fi
