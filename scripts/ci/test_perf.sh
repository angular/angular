#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

IOS_SERVER_BINARY="ios-server-standalone-0.6.6-SNAPSHOT.jar"
# This is fixed as Jenkins is running on the host
# that also hosts the wifi
HOSTNAME="192.168.2.1"
PROTRACTOR="./node_modules/.bin/protractor"
# TODO(tbosch): only running a smoke test on iOS as our transpiled sources don't run in Safari yet.
IOS_ARGS="--seleniumAddress=http://localhost:5555/wd/hub --hostname=$HOSTNAME \
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
  kill $serverPid
  if [[ $iosServerPid ]]; then
    kill $iosServerPid
  fi
}

trap killServer EXIT

./node_modules/.bin/webdriver-manager update

echo Starting webserver
./node_modules/.bin/gulp serve.js.prod serve.js.dart2js&
serverPid=$!

if [[ $IOS_BROWSER ]]; then
  echo Starting ios selenium server
  java -jar $IOS_SERVER_BINARY -real &>/dev/null&
  iosServerPid=$!
fi

# wait for server to come up!
sleep 20

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
