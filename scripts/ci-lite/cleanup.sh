#!/usr/bin/env bash

set -u -e -o pipefail

# override test failure so that we perform this file regardless and not abort in env.sh
TRAVIS_TEST_RESULT=0

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


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
