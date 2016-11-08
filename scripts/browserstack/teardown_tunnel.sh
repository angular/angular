#!/bin/bash

set -e -o pipefail


echo "Shutting down Browserstack tunnel"

PID=$(cat $BROWSER_PROVIDER_READY_FILE);

# Resolving the PID from the readyfile.
kill $PID


while [[ -n `ps -ef | grep $PID | grep -v "grep"` ]]; do
  printf "."
  sleep .5
done

echo ""
echo "Browserstack tunnel has been shut down"