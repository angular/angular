#!/bin/bash

# Go to the project root directory
cd $(dirname ${0})/../..

# Paths to the dashboard and functions directories.
dashboardFolder=tools/dashboard

# Go to the dashboard folder because otherwise the Firebase CLI tries to deploy the wrong project.
cd ${dashboardFolder}

# Install node modules for dashboard functions. Firebase CLI needs to execute the functions
# before it can collect all functions and deploy them.
(cd functions; npm install)

if [ -z ${MATERIAL2_BOARD_FIREBASE_DEPLOY_KEY} ]; then
  echo "Error: No access token for firebase specified." \
       "Please set the environment variable 'MATERIAL2_DASHBOARD_ACCESS_TOKEN'."
  exit 1
fi

# Deploy the dashboard functions to Firebase. For now only the functions will be deployed.
$(npm bin)/firebase deploy \
  --only functions --token ${MATERIAL2_BOARD_FIREBASE_DEPLOY_KEY} --project material2-board
