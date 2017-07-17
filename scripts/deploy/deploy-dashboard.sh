#!/bin/bash

# The script should immediately exit if any command in the script fails.
set -e

# This script deploys the Dashboard App and their Cloud Functions to Firebase.
# Before deploying, the script installs all dependencies and builds the dashboard app in production.

# Go to the project root directory
cd $(dirname ${0})/../..

if [ -z ${MATERIAL2_BOARD_FIREBASE_DEPLOY_KEY} ]; then
  echo "Error: No access token for firebase specified." \
       "Please set the environment variable 'MATERIAL2_DASHBOARD_ACCESS_TOKEN'."
  exit 1
fi

# Paths to the dashboard and functions directories.
dashboardFolder=tools/dashboard

# Path to the firebase binary of the root package.json
firebaseBin=$(npm bin)/firebase

# Go to the dashboard folder because otherwise the Firebase CLI tries to deploy the wrong project.
cd ${dashboardFolder}

# Install node_modules for the dashboard and afterwards build the dashboard app in production.
(npm install; $(npm bin)/ng build --aot -prod) &

# Install node modules for dashboard functions. Firebase CLI needs to execute the functions
# to collect all function names before it can deploy them.
(cd functions; npm install) &

# The dashboard and function dependencies are installed concurrently. Also the dashboard app is
# build in production afterwards. Wait for all async tasks to finish before proceeding.
wait

# Deploy the dashboard to Firebase. Based on the current configuration hosting and functions
# will be deployed.
${firebaseBin} deploy --token ${MATERIAL2_BOARD_FIREBASE_DEPLOY_KEY} \
  --non-interactive --project material2-board
