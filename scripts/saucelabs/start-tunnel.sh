#!/usr/bin/env bash

set -x -u -e -o pipefail

readonly currentDir=$(cd $(dirname $0); pwd)

# Command arguments that will be passed to sauce-connect.
sauceArgs=""

if [[ ! -z "${SAUCE_READY_FILE}" ]]; then
  sauceArgs="${sauceArgs} --readyfile ${SAUCE_READY_FILE}"
fi

if [[ ! -z "${SAUCE_PID_FILE}" ]]; then
  mkdir -p $(dirname ${SAUCE_PID_FILE})
  sauceArgs="${sauceArgs} --pidfile ${SAUCE_PID_FILE}"
fi

if [[ ! -z "${SAUCE_TUNNEL_IDENTIFIER}" ]]; then
  sauceArgs="${sauceArgs} --tunnel-identifier ${SAUCE_TUNNEL_IDENTIFIER}"
fi

echo "Starting Sauce Connect. Passed arguments: ${sauceArgs}"

${currentDir}/../../node_modules/sauce-connect/bin/sc -u ${SAUCE_USERNAME} -k ${SAUCE_ACCESS_KEY} ${sauceArgs}
