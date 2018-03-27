#!/usr/bin/env bash

set -u -e -o pipefail

IS_CI=${CIRCLECI:-}
CI_MODE=${CI_MODE:-}

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh

(node tools/npm/check-node-modules --purge && yarn postinstall) || yarn install --frozen-lockfile --non-interactive
$(npm bin)/bower install
if [[ ${CIRCLECI} &&
  ${CI_MODE} == "aio" ||
  ${CI_MODE} == "aio_e2e" ||
  ${CI_MODE} == "aio_tools_test"
]]; then
  # angular.io: Install all yarn dependencies according to angular.io/yarn.lock
  travisFoldStart "yarn-install.aio"
    (
      # HACK (don't submit with this): Build Angular
      ./build.sh --packages=core,elements --examples=false

      cd ${PROJECT_ROOT}/aio
      yarn install --frozen-lockfile --non-interactive
    )
  travisFoldEnd "yarn-install.aio"
fi
# Install Sauce Connect
if [[ ${IS_CI}] && (${CI_MODE} == "saucelabs_required" || ${CI_MODE} == "saucelabs_optional") ]]; then
  travisFoldStart "install-sauceConnect"
    (
      ${thisDir}/../sauce/sauce_connect_setup.sh
    )
  travisFoldEnd "install-sauceConnect"
fi


# Install BrowserStack Tunnel
if [[ ${IS_CI} && (${CI_MODE} == "browserstack_required" || ${CI_MODE} == "browserstack_optional") ]]; then
  travisFoldStart "install-browserstack"
    (
      ${thisDir}/../browserstack/start_tunnel.sh
    )
  travisFoldEnd "install-browserstack"
fi

# Print return arrows as a log separator
travisFoldReturnArrows
