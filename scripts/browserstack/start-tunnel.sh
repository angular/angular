#!/bin/bash

set -e -o pipefail

# Workaround for Travis CI cookbook https://github.com/travis-ci/travis-ci/issues/4862,
# where $PATH will be extended with relative paths to the NPM binaries.
PATH=`echo ${PATH} | sed -e 's/:\.\/node_modules\/\.bin//'`

TUNNEL_FILE="BrowserStackLocal-linux-x64.zip"
TUNNEL_URL="https://www.browserstack.com/browserstack-local/${TUNNEL_FILE}"
TUNNEL_DIR="/tmp/browserstack-tunnel"
TUNNEL_LOG="${LOGS_DIR}/browserstack-tunnel.log"

BROWSER_STACK_ACCESS_KEY=`echo ${BROWSER_STACK_ACCESS_KEY} | rev`

# Cleanup and create the folder structure for the tunnel connector.
rm -rf ${TUNNEL_DIR} ${BROWSER_PROVIDER_READY_FILE}
mkdir -p ${TUNNEL_DIR}
touch ${TUNNEL_LOG}

cd ${TUNNEL_DIR}

# Download the browserstack local binaries.
curl ${TUNNEL_URL} -o ${TUNNEL_FILE} 2> /dev/null 1> /dev/null

# Extract the browserstack local binaries from the tarball.
mkdir -p browserstack-tunnel
unzip -q ${TUNNEL_FILE} -d browserstack-tunnel

# Cleanup the download directory.
rm ${TUNNEL_FILE}

ARGS=""

# Set tunnel-id only on Travis, to make local testing easier.
if [ ! -z "${TRAVIS_JOB_ID}" ]; then
  ARGS="${ARGS} --local-identifier ${TRAVIS_JOB_ID}"
fi

echo "Starting Browserstack Local in the background, logging into: ${TUNNEL_LOG}"

# Extension to the BrowserStackLocal binaries, because those can't create a readyfile.
function create_ready_file {

  # To be able to exit the tail properly we need to have a sub shell spawned, which is
  # used to track the state of tail.
  { sleep 120; touch ${BROWSER_PROVIDER_ERROR_FILE}; } &

  TIMER_PID=${!}

  # Disown the background process, because we don't want to show any messages when killing
  # the timer.
  disown

  # When the tail recognizes the `Ctrl-C` log message the BrowserStack Tunnel is up.
  {
    tail -n0 -f ${TUNNEL_LOG} --pid ${TIMER_PID} | { sed '/Ctrl/q' && kill -9 ${TIMER_PID}; };
  } &> /dev/null

  echo
  echo "BrowserStack Tunnel ready"

  touch ${BROWSER_PROVIDER_READY_FILE}
}

browserstack-tunnel/BrowserStackLocal -k ${BROWSER_STACK_ACCESS_KEY} ${ARGS} 2>&1 >> ${TUNNEL_LOG} &

# Wait for the tunnel to be ready and create the readyfile with the Browserstack PID
create_ready_file &
