#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

./node_modules/.bin/webdriver-manager update
./node_modules/.bin/webdriver-manager start&
webdriverServerPid=$!
ps -ef | grep webdriver-manager

./node_modules/.bin/gulp serve.js.dart2js&
serverPid=$!

function killAllServers () {
  kill $serverPid
  pkill -P $webdriverServerPid
}

trap killAllServers EXIT

# wait for server to come up!
sleep 3

./node_modules/.bin/gulp test.transpiler.unittest
./node_modules/.bin/gulp test.server.dart --browsers=$KARMA_BROWSERS
