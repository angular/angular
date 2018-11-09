#!/bin/bash

tunnelTmpDir="/tmp/material-saucelabs"
tunnelLogFile="${tunnelTmpDir}/saucelabs-connect.log"
tunnelReadyFile="${tunnelTmpDir}/readyfile"

WAIT_DELAY=30

# Method that prints the logfile output of the saucelabs tunnel.
printLog() {
  echo "Logfile output of Saucelabs tunnel (${tunnelLogFile}):"
  echo ""
  cat ${tunnelLogFile}
}

# Wait for Saucelabs Connect to be ready before exiting
# Time out if we wait for more than 2 minutes, so the process won't run forever.
let "counter=0"

while [ ! -f ${tunnelReadyFile} ]; do
  let "counter++"

  # Counter needs to be multiplied by two because the while loop only sleeps a half second.
  # This has been made in favor of better progress logging (printing dots every half second)
  if [ $counter -gt $[${WAIT_DELAY} * 2] ]; then
    echo ""
    echo "Timed out after 2 minutes waiting for tunnel ready file"
    printLog
    exit 5
  fi

  printf "."
  sleep 0.5
done

echo ""
echo "Connected to Saucelabs"
