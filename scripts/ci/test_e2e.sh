#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

./node_modules/.bin/webdriver-manager update

function killServer () {
  kill $serverPid
}

./node_modules/.bin/gulp serve.js.prod serve.js.dart2js&
serverPid=$!

trap killServer EXIT

if [[ $PERF_BROWSERS =~ .*Android.* ]]
then
  adb usb
  adb wait-for-device
  adb reverse tcp:8001 tcp:8001
  adb reverse tcp:8002 tcp:8002
fi

./node_modules/.bin/protractor protractor-e2e-js.conf.js --browsers=$E2E_BROWSERS
./node_modules/.bin/protractor protractor-e2e-dart2js.conf.js --browsers=$E2E_BROWSERS