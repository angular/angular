#!/bin/bash

set -e -o pipefail

tunnelTmpDir="/tmp/material-saucelabs"
tunnelPidFile="${tunnelTmpDir}/pidfile"

if [[ ! -f ${tunnelPidFile} ]]; then
  echo "Could not find Saucelabs tunnel PID file. Cannot stop tunnel.."
  exit 1
fi

echo "Shutting down Sauce Connect tunnel"

# The process id for the sauce-connect instance is stored inside of the pidfile.
tunnelProcessId=$(cat ${tunnelPidFile})

# Kill the process by using the PID that has been read from the pidfile. Note that
# we cannot use killall because CircleCI base container images don't have it installed.
kill ${tunnelProcessId}

while (ps -p ${tunnelProcessId} &> /dev/null); do
  printf "."
  sleep .5
done

echo ""
echo "Sauce Connect tunnel has been shut down"
