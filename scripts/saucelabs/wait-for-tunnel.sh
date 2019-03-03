#!/usr/bin/env bash

# Disable printing of any executed command because this would cause a lot
# of spam due to the loop.
set +x -u -e -o pipefail

# Waits for Saucelabs Connect to be ready before executing any tests.
counter=0

while [[ ! -f ${SAUCE_READY_FILE} ]]; do
  counter=$((counter + 1))

  # Counter needs to be multiplied by two because the while loop only sleeps a half second.
  # This has been made in favor of better progress logging (printing dots every half second)
  if [ $counter -gt $[${SAUCE_READY_FILE_TIMEOUT} * 2] ]; then
    echo "Timed out after ${SAUCE_READY_FILE_TIMEOUT} seconds waiting for tunnel ready file."
    echo "Printing logfile output:"
    echo ""
    cat ${SAUCE_LOG_FILE}
    exit 5
  fi

  printf "."
  sleep 0.5
done

echo ""
echo "Connected to Saucelabs"
