#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


case ${CI_MODE} in
  js)
    ${thisDir}/test-js.sh
    ;;
  e2e)
    ${thisDir}/test-e2e.sh
    ;;
  e2e_2)
    ${thisDir}/test-e2e-2.sh
    ;;
  saucelabs_required)
    ${thisDir}/test-saucelabs.sh
    ;;
  browserstack_required)
    ${thisDir}/test-browserstack.sh
    ;;
  saucelabs_optional)
    ${thisDir}/test-saucelabs.sh
    ;;
  browserstack_optional)
    ${thisDir}/test-browserstack.sh
    ;;
  aio_tools_test)
    ${thisDir}/test-aio-tools.sh
    ;;
  aio)
    ${thisDir}/test-aio.sh
    ;;
  aio_e2e)
    ${thisDir}/test-aio-e2e.sh
    ;;
esac
