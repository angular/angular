#!/bin/bash

# Wait for Connect to be ready before exiting
echo "Connecting to Sauce Labs"


# Wait for Saucelabs Connect to be ready before exiting
# Time out if we wait for more than 2 minutes, so the process won't run forever.
let "counter=0"

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

echo
echo "Connected"
