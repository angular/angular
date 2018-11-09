#!/bin/bash

# In case any command failed, we want to immediately exit the script with the
# proper exit code.
set -e

# Go to project directory.
cd $(dirname ${0})/../..

# Decode access token and make it accessible for child processes.
export SAUCE_ACCESS_KEY=`echo ${SAUCE_ACCESS_KEY} | rev`

# Start tunnel and wait for it being ready.
./scripts/saucelabs/start-tunnel.sh
./scripts/saucelabs/wait-tunnel.sh

# Setup the test platform environment variable that will be read
# by the Karma configuration script.
export TEST_PLATFORM="saucelabs"

# Run the unit tests on Saucelabs with Karma.
yarn gulp ci:test

# Kill the Saucelabs tunnel. This is necessary in order to avoid rate-limit
# errors that cause the unit tests to be flaky.
./scripts/saucelabs/stop-tunnel.sh
