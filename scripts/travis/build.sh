#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..
source ./scripts/env.sh

./node_modules/.bin/gulp build

pub install

./node_modules/karma/bin/karma start karma-js.conf \
        --reporters=dots \
        --browsers=$BROWSERS --single-run
./node_modules/karma/bin/karma start karma-dart.conf \
        --reporters=dots \
        --browsers=$BROWSERS --single-run

./node_modules/.bin/webdriver-manager update

function killServer () {
  kill $serverPid
}

./node_modules/.bin/gulp serve.js.prod serve.js.dart2js&
serverPid=$!

trap killServer EXIT

./node_modules/.bin/protractor protractor-e2e-js.conf.js
./node_modules/.bin/protractor protractor-e2e-dart2js.conf.js