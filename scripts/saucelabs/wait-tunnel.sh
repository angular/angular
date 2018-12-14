#!/bin/bash

tunnelTmpDir="/tmp/material-saucelabs"
tunnelReadyFile="${tunnelTmpDir}/readyfile"

WAIT_DELAY=120

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
    exit 5
  fi

  printf "."
  sleep 0.5
done

echo ""
echo "Connected to Saucelabs"
