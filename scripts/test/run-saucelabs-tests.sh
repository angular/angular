#!/usr/bin/env bash

# Convienence script for running all saucelabs test targets.
# See tools/saucelabs-daemon/README.md for more information.

set -eu -o pipefail

NUMBER_OF_PARALLEL_BROWSERS="${1:-2}"

if [[ -z "${SAUCE_USERNAME:-}" ]]; then
  echo "ERROR: SAUCE_USERNAME environment variable must be set; see tools/saucelabs-daemon/README.md for more info."
  exit 1
fi
if [[ -z "${SAUCE_ACCESS_KEY:-}" ]]; then
  echo "SAUCE_ACCESS_KEY environment variable must be set; see tools/saucelabs-daemon/README.md for more info."
  exit 1
fi
if [[ -z "${SAUCE_TUNNEL_IDENTIFIER:-}" ]]; then
  echo "SAUCE_TUNNEL_IDENTIFIER environment variable must be set; see tools/saucelabs-daemon/README.md for more info."
  exit 1
fi

# First build the background-service binary target so the build runs in the foreground
yarn bazel build //tools/saucelabs-daemon/background-service

# Query for the test targets to run
TESTS=$(./node_modules/.bin/bazelisk query --output label '(kind(karma_web_test, ...) intersect attr("tags", "saucelabs", ...)) except attr("tags", "fixme-saucelabs", ...)')

# Build all test targets so the build can fan out to all CPUs
yarn bazel build ${TESTS}

# Start the saucelabs-daemon background service in the background
yarn bazel run //tools/saucelabs-daemon/background-service -- "$NUMBER_OF_PARALLEL_BROWSERS" &
BACKGROUND_SERVICE_PID=$!

# Trap on exit so we always kill the background service
function kill_background_service {
  echo "Killing background service..."
  kill $BACKGROUND_SERVICE_PID  # Kill the backgound service
  sleep 2  # Let the output of the background service flush
  echo "All done"
}
trap kill_background_service INT TERM

# Small pause to give time for the background service to open up its IPC port and start listening
sleep 2

# Run all of the saucelabs test targets
yarn bazel test --config=saucelabs --jobs="$NUMBER_OF_PARALLEL_BROWSERS" ${TESTS}

kill_background_service
