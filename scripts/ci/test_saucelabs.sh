#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

./scripts/sauce/sauce_connect_setup.sh
./scripts/sauce/sauce_connect_block.sh
./node_modules/.bin/gulp build.js
#./node_modules/.bin/gulp test.unit.js.sauce/ci

./node_modules/.bin/webdriver-manager update

function killServer () {
  kill $serverPid
}

./node_modules/.bin/gulp serve.js.prod&
serverPid=$!

./node_modules/.bin/gulp build.css.material&

trap killServer EXIT

# wait for server to come up!
sleep 10

./node_modules/.bin/protractor protractor-js-sauce.conf.js
