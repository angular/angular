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

# wait for server to come up!
sleep 10

./node_modules/.bin/protractor protractor-perf-js.conf.js --browsers=$PERF_BROWSERS
./node_modules/.bin/protractor protractor-perf-dart2js.conf.js --browsers=$PERF_BROWSERS