#!/bin/bash

# In case any command failed, we want to immediately exit the script with the
# proper exit code.
set -e

# Path to the project directory.
projectDir="$(dirname ${0})/../.."

# Go to project directory.
cd ${projectDir}

# Decode access token and make it accessible for child processes.
export BROWSER_STACK_ACCESS_KEY=`echo ${BROWSER_STACK_ACCESS_KEY} | rev`

# Setup the test platform environment variable that will be read
# by the Karma configuration script.
export TEST_PLATFORM="browserstack"

# Build the legacy tests
node ./scripts/create-legacy-tests-bundle.mjs

# Run Karma
yarn karma start ./test/karma.conf.js --single-run

# Wait for all sub processes to terminate properly.
wait
