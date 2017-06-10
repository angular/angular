#!/bin/bash

# The script should immediately exit if any command in the script fails.
set -e

if [ -z ${MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN} ]; then
  echo "Error: No access token for firebase specified." \
       "Please set the environment variable 'MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN'."
  exit 1
fi

# Go to the project root directory
cd $(dirname ${0})/../..

# Paths to the screenshot-test directory that also contains the function directory.
screenshotTestFolder=tools/screenshot-test

# Go to the screenshot-test folder because otherwise Firebase tries to deploy the wrong project.
cd ${screenshotTestFolder}

# Install node modules for the screenshot functions. Firebase CLI needs to execute the functions
# before it can collect all functions and deploy them.
(cd functions; npm install)

# Deploy the screenshot functions to Firebase
$(npm bin)/firebase deploy --only functions --token ${MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN} \
  --project material2-screenshots
