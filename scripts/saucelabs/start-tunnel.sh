#!/bin/bash

set -e -o pipefail

tunnelFileName="sc-4.5.1-linux.tar.gz"
tunnelUrl="https://saucelabs.com/downloads/${tunnelFileName}"

tunnelTmpDir="/tmp/material-saucelabs"
tunnelReadyFile="${tunnelTmpDir}/readyfile"
tunnelPidFile="${tunnelTmpDir}/pidfile"

# Cleanup and create the folder structure for the tunnel connector.
rm -rf ${tunnelTmpDir}
mkdir -p ${tunnelTmpDir}

# Go into the temporary tunnel directory.
cd ${tunnelTmpDir}

# Download the saucelabs connect binaries.
curl ${tunnelUrl} -o ${tunnelFileName} 2> /dev/null 1> /dev/null

# Extract the saucelabs connect binaries from the tarball.
mkdir -p sauce-connect
tar --extract --file=${tunnelFileName} --strip-components=1 --directory=sauce-connect > /dev/null

# Cleanup the download directory.
rm ${tunnelFileName}

# Command arguments that will be passed to sauce-connect.
sauceArgs="--readyfile ${tunnelReadyFile} --pidfile ${tunnelPidFile}"

if [ ! -z "${CIRCLE_BUILD_NUM}" ]; then
  sauceArgs="${sauceArgs} --tunnel-identifier angular-material-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"
fi

echo "Starting Sauce Connect in the background. Passed arguments: ${sauceArgs}"

sauce-connect/bin/sc -u ${SAUCE_USERNAME} -k ${SAUCE_ACCESS_KEY} ${sauceArgs} &
