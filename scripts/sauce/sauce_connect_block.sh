#!/bin/bash

# Wait for Connect to be ready before exiting
echo "Connecting to Sauce Labs"
while [ ! -f $BROWSER_PROVIDER_READY_FILE ]; do
  printf "."
  #dart2js takes longer than the travis 10 min timeout to complete
  sleep .5
done
echo
echo "Connected"
