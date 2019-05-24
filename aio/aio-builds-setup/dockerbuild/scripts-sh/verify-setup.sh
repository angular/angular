#!/bin/bash
set -eu -o pipefail

logFile=/var/log/aio/verify-setup.log
previewServerLogFile=/var/log/aio/preview-server-verify-setup.log

exec 3>&1
exec >> $logFile
exec 2>&1

echo "[`date`] - Starting verification..."

# Helpers
function countdown {
  message=$1
  secs=$2
  while [ $secs -gt 0 ]; do
    echo -ne "$message in $secs...\033[0K\r"
    sleep 1
    : $((secs--))
  done
  echo -ne "\033[0K\r"
}

function onExit {
  echo -e "Stopping Test Server"
  aio-preview-server-test stop
  echo -e "Full logs in '$logFile'.\n" > /dev/fd/3
}

# Setup EXIT trap
trap 'onExit' EXIT

# Start an preview-server instance for testing
echo -e "Starting Test Server"
aio-preview-server-test start --log $previewServerLogFile

# Give the preview-server some time to start :(
countdown "Starting" 5 > /dev/fd/3

# Run the tests
echo Running the tests
source aio-test-env
node $AIO_SCRIPTS_JS_DIR/dist/lib/verify-setup | tee /dev/fd/3
