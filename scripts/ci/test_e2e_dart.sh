#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
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

SELENIUM_STDERR=$LOGS_DIR/selenium_standalone_stderr.txt
SELENIUM_SDDOUT=$LOGS_DIR/selenium_standalone_stdout.txt
./node_modules/.bin/webdriver-manager start &

# Wait for selenium standalone to come up
sleep 5

./node_modules/.bin/protractor protractor-dart2js.conf.js --browsers=${E2E_BROWSERS:-Dartium}
