#!/bin/bash

# The script should immediately exit if any command in the script fails.
set -e

# This script deploys the Screenshot Tool and their Cloud Functions to Firebase.
# Before deploying, the script installs all dependencies of the functions and builds the app.

# Go to the project root directory
cd $(dirname ${0})/../..

if [ -z ${MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN} ]; then
  echo "Error: No access token for firebase specified." \
       "Please set the environment variable 'MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN'."
  exit 1
fi

# Path to the screenshot tool in the project.
screenshotToolFolder="tools/screenshot-test"

# Path to the firebase binary of the root package.json
firebaseBin=$(npm bin)/firebase

# Go to the screenshot-test folder because otherwise Firebase tries to deploy the wrong project.
cd ${screenshotToolFolder}

# Install node_modules for the application and afterwards build the application in production.
(npm install; $(npm bin)/ng build --aot -prod) &

# Install node modules for screenshot-tool functions. Firebase CLI needs to execute the functions
# to collect all function names before it can deploy them.
(cd functions; npm install) &

# The screenshot application is being built asynchronously. Also the dependencies for the
# Cloud Functions are built asynchronously. This means that the script needs to wait for all
# async tasks to finish before proceeding.
wait

# Deploy the screenshot application and their functions to Firebase
${firebaseBin} deploy --token ${MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN} --non-interactive \
  --project material2-screenshots
