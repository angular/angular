#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


case ${CI_MODE} in
  js)
    ;;
  saucelabs_required)
    travisFoldStart "teardown.sauceConnect"
      ./scripts/sauce/sauce_connect_teardown.sh
    travisFoldEnd "teardown.sauceConnect"
    ;;
  browserstack_required)
    travisFoldStart "teardown.browserStack"
      ./scripts/browserstack/teardown_tunnel.sh
    travisFoldEnd "teardown.browserStack"
    ;;
  saucelabs_optional)
    travisFoldStart "teardown.sauceConnect"
      ./scripts/sauce/sauce_connect_teardown.sh
    travisFoldEnd "teardown.sauceConnect"
    ;;
  browserstack_optional)
    travisFoldStart "teardown.browserStack"
      ./scripts/browserstack/teardown_tunnel.sh
    travisFoldEnd "teardown.browserStack"
    ;;
esac

# Print return arrows as a log separator
travisFoldReturnArrows
