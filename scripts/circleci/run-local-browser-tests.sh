#!/bin/bash

# In case any command failed, we want to immediately exit the script with the
# proper exit code.
set -e

# Go to project directory.
cd $(dirname ${0})/../..

# Setup the test platform environment variable that will be read
# by the Karma configuration script.
export TEST_PLATFORM="local"

# Run the unit tests on the local browsers with Karma.
yarn gulp ci:test
