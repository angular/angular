#!/bin/bash

set -e -o pipefail

TUNNEL_FILE="sc-4.4.12-linux.tar.gz"
TUNNEL_URL="https://saucelabs.com/downloads/${TUNNEL_FILE}"
TUNNEL_DIR="/tmp/saucelabs-connect"

TUNNEL_LOG="${LOGS_DIR}/saucelabs-tunnel.log"

SAUCE_ACCESS_KEY=`echo ${SAUCE_ACCESS_KEY} | rev`

# Cleanup and create the folder structure for the tunnel connector.
rm -rf ${TUNNEL_DIR} ${BROWSER_PROVIDER_READY_FILE}
mkdir -p ${TUNNEL_DIR}

cd ${TUNNEL_DIR}

# Download the saucelabs connect binaries.
curl ${TUNNEL_URL} -o ${TUNNEL_FILE} 2> /dev/null 1> /dev/null

# Extract the saucelabs connect binaries from the tarball.
mkdir -p sauce-connect
tar --extract --file=${TUNNEL_FILE} --strip-components=1 --directory=sauce-connect > /dev/null

# Cleanup the download directory.
rm ${TUNNEL_FILE}

ARGS=""

# Set tunnel-id only on Travis, to make local testing easier.
if [ ! -z "${TRAVIS_JOB_ID}" ]; then
  ARGS="${ARGS} --tunnel-identifier ${TRAVIS_JOB_ID}"
fi
if [ ! -z "${BROWSER_PROVIDER_READY_FILE}" ]; then
  ARGS="${ARGS} --readyfile ${BROWSER_PROVIDER_READY_FILE}"
fi

echo "Starting Sauce Connect in the background, logging into: ${TUNNEL_LOG}"

sauce-connect/bin/sc -u ${SAUCE_USERNAME} -k ${SAUCE_ACCESS_KEY} ${ARGS} 2>&1 >> ${TUNNEL_LOG} &
