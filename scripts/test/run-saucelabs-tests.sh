#!/usr/bin/env bash

# Convienence script for running all saucelabs test targets.
# See tools/saucelabs-daemon/README.md for more information.

set -eu -o pipefail

NUMBER_OF_PARALLEL_BROWSERS="${1:-2}"
shift

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
pnpm bazel build //tools/saucelabs-daemon/background-service --build_runfile_links

# Query for the test targets to run
TESTS=$(./node_modules/.bin/bazelisk query --output label '(kind(karma_web_test, ...) intersect attr("tags", "saucelabs", ...)) except attr("tags", "fixme-saucelabs", ...)')

# Build all test targets so the build can fan out to all CPUs
pnpm bazel build ${TESTS}

# Start the saucelabs-daemon background service in the background. Run directly from the generated
# bash script instead of using bazel run so we get the PID of the node process. Otherwise killing
# the child process in kill_background_service doesn't kill the spawn node process.
cd dist/bin/tools/saucelabs-daemon/background-service/background-service.sh.runfiles/angular
../../background-service.sh "$NUMBER_OF_PARALLEL_BROWSERS" &
BACKGROUND_SERVICE_PID=$!
cd - > /dev/null

# Trap on exit so we always kill the background service
function kill_background_service {
  echo "Killing background service (pid $BACKGROUND_SERVICE_PID)..."
  kill $BACKGROUND_SERVICE_PID  # Kill the backgound service
  wait $BACKGROUND_SERVICE_PID  # Let the output of the background service flush
  echo "All done"
}
trap kill_background_service INT TERM

# Small pause to give time for the background service to open up its IPC port and start listening
sleep 2

# Run all of the saucelabs test targets
pnpm bazel test --config=saucelabs --jobs="$NUMBER_OF_PARALLEL_BROWSERS" ${TESTS} "$@"

kill_background_service
