#!/bin/bash

# Go to the project root directory
cd $(dirname ${0})/../..

# Install node modules for screenshot functions. Firebase CLI needs to execute the functions
# before it can collect all functions and deploy them.
(cd tools/screenshot-test/functions; npm install)

if [ -z ${MATERIAL2_SCREENSHOT_ACCESS_TOKEN} ]; then
  echo "Error: No access token for firebase specified." \
       "Please set the environment variable 'MATERIAL2_SCREENSHOT_ACCESS_TOKEN'."
  exit 1
fi

# Deploy the screenshot functions to Firebase
$(npm bin)/firebase deploy --only functions --token ${MATERIAL2_SCREENSHOT_ACCESS_TOKEN}
