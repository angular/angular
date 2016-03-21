#!/usr/bin/env bash

export MODE=e2e
export LOGS_DIR=/tmp/angular-material2-build/logs
export SAUCE_USERNAME=angular-ci
export SAUCE_ACCESS_KEY=9b988f434ff8-fbca-8aa4-4ae3-35442987
export TRAVIS_JOB_NUMBER=12345
export BROWSER_PROVIDER_READY_FILE=/tmp/angular-material2-build/readyfile


mkdir -p $LOGS_DIR
rm -f $BROWSER_PROVIDER_READY_FILE

# Force cleanup (shouldn't be necessary)
killall angular-cli
./scripts/sauce/sauce_connect_teardown.sh
# Run the script
./scripts/ci/build-and-test.sh
# Actual cleanup
./scripts/sauce/sauce_connect_teardown.sh
killall angular-cli
