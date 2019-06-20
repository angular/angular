#!/bin/bash

set -e -o pipefail

tunnelTmpDir="/tmp/material-browserstack"
tunnelReadyFile="${tunnelTmpDir}/readyfile"

if [[ ! -f ${tunnelReadyFile} ]]; then
  echo "BrowserStack tunnel has not been started. Cannot stop tunnel.."
  exit 1
fi

echo "Shutting down Browserstack tunnel.."

# The process id for the BrowserStack local instance is stored inside of the readyfile.
tunnelProcessId=$(cat ${tunnelReadyFile})

# Kill the process by using the PID that has been read from the readyfile. Note that
# we cannot use killall because CircleCI base container images don't have it installed.
kill ${tunnelProcessId}

echo ""
echo "Browserstack tunnel interrupt signal has been sent."
