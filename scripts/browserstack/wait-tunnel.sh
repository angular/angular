#!/bin/bash

TUNNEL_LOG="$LOGS_DIR/browserstack-tunnel.log"

# Wait for Connect to be ready before exiting
# Time out if we wait for more than 2 minutes, so the process won't run forever.
let "counter=0"

# Exit the process if there are errors reported. Print the tunnel log to the console.
if [ -f $BROWSER_PROVIDER_ERROR_FILE ]; then
  echo
  echo "An error occurred while starting the tunnel. See error:"
  cat $TUNNEL_LOG
  exit 5
fi

while [ ! -f $BROWSER_PROVIDER_READY_FILE ]; do
  let "counter++"

  if [ $counter -gt 240 ]; then
    echo
    echo "Timed out after 2 minutes waiting for tunnel ready file"
    exit 5
  fi

  printf "."
  sleep .5
done
