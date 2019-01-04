#!/usr/bin/env bash

set -u -e -o pipefail

TRAVIS=${TRAVIS:-}
CI_MODE=${CI_MODE:-}



mkdir -p ${LOGS_DIR}


# Install Sauce Connect
if [[ ${TRAVIS}] && (${CI_MODE} == "saucelabs_required" || ${CI_MODE} == "saucelabs_optional") ]]; then
  travisFoldStart "install-sauceConnect"
    (
      ${thisDir}/../sauce/sauce_connect_setup.sh
    )
  travisFoldEnd "install-sauceConnect"
fi


# Install BrowserStack Tunnel
if [[ ${TRAVIS} && (${CI_MODE} == "browserstack_required" || ${CI_MODE} == "browserstack_optional") ]]; then
  travisFoldStart "install-browserstack"
    (
      ${thisDir}/../browserstack/start_tunnel.sh
    )
  travisFoldEnd "install-browserstack"
fi

# Print return arrows as a log separator
travisFoldReturnArrows
