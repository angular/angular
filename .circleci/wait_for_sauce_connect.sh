#!/usr/bin/env bash

set -u -e

# Wait for Connect to be ready before exiting
# This script requires your CircleCI environment to include the following env variables:
# SAUCE_READY_FILE

printf "Connecting to Sauce."
while [ ! -f $SAUCE_READY_FILE ]; do
  printf "."
  sleep .5
done
echo "Connected"