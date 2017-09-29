#!/bin/bash

# Function that can be used to re-call a specific command a specific amount of times if it fails.
#   @param ${1} Amount of retry calls
#   @param ${2} Code block that will be invoked
function retryCall() {
  retries=0

  until [ ${retries} -gt ${1} ]; do
    # Call the command and break the loop if it exits without any errors.
    (${2}) && return 0

    # Increase the counter of the invoked retries.
    retries=$[${retries} + 1]

    # Sleep a few seconds and log an info message if there are still remaining retries.
    if [ ${retries} -le ${1} ]; then
      echo "Script didn't exit without errors. Retrying $[${1} - retries + 1] times..."
      sleep 1
    fi
  done

  echo "Script exited with errors. Exiting process.."
  exit 1
}
