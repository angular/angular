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

./node_modules/.bin/gulp build.css.material&
./node_modules/.bin/gulp build.http.example&

trap killServer EXIT

# wait for server to come up!
sleep 10

./node_modules/.bin/protractor protractor-dart2js.conf.js --browsers=${E2E_BROWSERS:-Dartium}
./node_modules/.bin/protractor protractor-dart2js.conf.js --benchmark --dryrun --browsers=${E2E_BROWSERS:-Dartium}
