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

./node_modules/.bin/gulp serve.js.dart2js&
serverPid=$!

trap killServer EXIT

# wait for server to come up!
sleep 10

./node_modules/.bin/protractor protractor-e2e-dart2js.conf.js --browsers=$E2E_BROWSERS