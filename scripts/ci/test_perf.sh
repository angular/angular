#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

IOS_SERVER_BINARY="ios-server-standalone-0.6.6-SNAPSHOT.jar"
PROTRACTOR="./node_modules/.bin/protractor"
# TODO(tbosch): only running a smoke test on iOS as our transpiled sources don't run in Safari yet.
IOS_ARGS="--seleniumAddress=http://localhost:5555/wd/hub --hostname=$CIHOSTADDRESS \
  --specs=dist/js/cjs/examples/e2e_test/benchpress/smoke_test_perf.js"
IOS_BROWSER_NAME="SafariIos"

# Split $PERF_BROWSERS into $NON_IOS_BROWSERS and $IOS_BROWSER
# This is needed as we need a special selenium server for ios
if [[ $PERF_BROWSERS == *$IOS_BROWSER_NAME* ]]; then
  IOS_BROWSER=$IOS_BROWSER_NAME
fi
NON_IOS_BROWSERS=${PERF_BROWSERS/$IOS_BROWSER_NAME/}
# remove extra command at front/end
NON_IOS_BROWSERS=${NON_IOS_BROWSERS#,}
NON_IOS_BROWSERS=${NON_IOS_BROWSERS%,}

source $SCRIPT_DIR/env_dart.sh

function killServer () {
  if [[ $serverPid ]]; then
    kill $serverPid
  fi
  if [[ $iosServerPid ]]; then
    kill $iosServerPid
  fi
}

trap killServer EXIT

function waitForUrl {
  URL=$1
  COUNT=0
  MAX_COUNT=120
  until curl $URL &> /dev/null || [[ $COUNT == $MAX_COUNT ]]; do
    sleep 1
    echo waiting $((COUNT++)) seconds
  done
  if [[ $COUNT == $MAX_COUNT ]]; then
    echo timeout after waiting $COUNT seconds!
    return 1
  else
    return 0
  fi
}

./node_modules/.bin/webdriver-manager update

echo Starting webserver
./node_modules/.bin/gulp serve.js.prod serve.js.dart2js&
serverPid=$!
waitForUrl http://localhost:8001
echo Started webserver

if [[ $IOS_BROWSER ]]; then
  echo Starting ios selenium server
  java -jar $IOS_SERVER_BINARY -real &> /dev/null&
  iosServerPid=$!
  waitForUrl http://localhost:5555/wd/hub
  echo Started ios selenium server
fi

if [[ $IOS_BROWSER ]]; then
  echo Running ios tests
  $PROTRACTOR protractor-js.conf.js --benchmark --browsers=$IOS_BROWSER $IOS_ARGS
  # TODO $PROTRACTOR protractor-dart2js.conf.js --benchmark --browsers=$IOS_BROWSER $IOS_ARGS
fi
if [[ $NON_IOS_BROWSERS ]]; then
  echo Running non ios tests
  $PROTRACTOR protractor-js.conf.js --benchmark --browsers=$NON_IOS_BROWSERS
  # TODO $PROTRACTOR protractor-dart2js.conf.js --benchmark --browsers=$NON_IOS_BROWSERS
fi
