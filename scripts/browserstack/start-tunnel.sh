#!/bin/bash

set -e -o pipefail

tunnelFileName="BrowserStackLocal-linux-x64.zip"
tunnelUrl="https://www.browserstack.com/browserstack-local/${tunnelFileName}"

tunnelTmpDir="/tmp/material-browserstack"
tunnelLogFile="${tunnelTmpDir}/browserstack-local.log"
tunnelReadyFile="${tunnelTmpDir}/readyfile"
tunnelErrorFile="${tunnelTmpDir}/errorfile"

# Cleanup and create the folder structure for the tunnel connector.
rm -rf ${tunnelTmpDir}
mkdir -p ${tunnelTmpDir}
touch ${tunnelLogFile}

# Go into temporary tunnel directory.
cd ${tunnelTmpDir}

# Download the browserstack local binaries.
curl ${tunnelUrl} -o ${tunnelFileName} 2> /dev/null 1> /dev/null

# Extract the browserstack local binaries from the tarball.
mkdir -p browserstack-tunnel
unzip -q ${tunnelFileName} -d browserstack-tunnel

# Cleanup the downloaded zip archive.
rm ${tunnelFileName}

ARGS=""

if [ ! -z "${CIRCLE_BUILD_NUM}" ]; then
  ARGS="${ARGS} --local-identifier angular-material-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"
fi

echo "Starting Browserstack Local in the background, logging into: ${tunnelLogFile}"

# Extension to the BrowserStackLocal binaries, because those can't create a readyfile.
function create_ready_file {
  # Process ID for the BrowserStack local asynchronous instance.
  tunnelProcessPid=${1}

  # To be able to exit the tail properly we need to have a sub shell spawned, which is
  # used to track the state of tail.
  { sleep 120; touch ${tunnelErrorFile}; } &

  TIMER_PID=${!}

  # Disown the background process, because we don't want to show any messages when killing
  # the timer.
  disown

  # When the tail recognizes the `Ctrl-C` log message the BrowserStack Tunnel is up.
  {
    tail -n0 -f ${tunnelLogFile} --pid ${TIMER_PID} | { sed '/Ctrl/q' && kill -9 ${TIMER_PID}; };
  } &> /dev/null

  echo
  echo "BrowserStack Tunnel ready"

  # Create the readyfile and write the PID for BrowserStack Local into it.
  echo ${tunnelProcessPid} > ${tunnelReadyFile}
}

browserstack-tunnel/BrowserStackLocal -k ${BROWSER_STACK_ACCESS_KEY} ${ARGS} 2>&1 >> \
  ${tunnelLogFile} &

# Wait for the tunnel to be ready and create the readyfile with the Browserstack PID
create_ready_file ${!} &
