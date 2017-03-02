#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


case ${CI_MODE} in
  js)
    ./scripts/ci-lite/test_js.sh
    ;;
  e2e)
    ./scripts/ci-lite/test_e2e.sh
    ;;
  saucelabs_required)
    ./scripts/ci-lite/test_saucelabs.sh
    ;;
  browserstack_required)
    ./scripts/ci-lite/test_browserstack.sh
    ;;
  saucelabs_optional)
    ./scripts/ci-lite/test_saucelabs.sh
    ;;
  browserstack_optional)
    ./scripts/ci-lite/test_browserstack.sh
    ;;
  docs_test)
    ./scripts/ci-lite/test_docs.sh
    ;;
  aio)
    ./scripts/ci-lite/test_aio.sh
    ;;
esac
