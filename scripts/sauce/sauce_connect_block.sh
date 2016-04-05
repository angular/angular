#!/bin/bash

# Wait for Connect to be ready before exiting
echo "Connecting to Sauce Labs"
while [ ! -f $BROWSER_PROVIDER_READY_FILE ]; do
  printf "."
  sleep .5
done
echo
echo "Connected"
