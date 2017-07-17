#!/bin/bash

# The script should immediately exit if any command in the script fails.
set -e

# This script deploys the Cloud Functions of the screenshot tool to Firebase.
# Before deploying, the script installs all dependencies of the functions.

# Go to the project root directory
cd $(dirname ${0})/../..

if [ -z ${MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN} ]; then
  echo "Error: No access token for firebase specified." \
       "Please set the environment variable 'MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN'."
  exit 1
fi

# Path to the screenshot tool in the project.
screenshotToolFolder="tools/dashboard"

# Path to the firebase binary of the root package.json
firebaseBin=$(npm bin)/firebase

# Go to the screenshot-test folder because otherwise Firebase tries to deploy the wrong project.
cd ${screenshotToolFolder}

# Install node modules for the screenshot functions. Firebase CLI needs to execute the functions
# to collect all function names before it can deploy them.
(cd functions; npm install)

# Deploy the screenshot functions to Firebase
${firebaseBin} deploy --only functions --token ${MATERIAL2_SCREENSHOT_FIREBASE_DEPLOY_TOKEN} \
  --non-interactive --project material2-screenshots
