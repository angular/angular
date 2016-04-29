#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "js" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.js'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.node'

# Run unit tests in node
node ./dist/tools/tsc-watch/ node

echo 'travis_fold:end:test.node'



echo 'travis_fold:start:test.localChrome'

# rebuild since codegen has overwritten some files.
$(npm bin)/tsc -p modules/tsconfig.json

# Run unit tests in local chrome
if [[ ${TRAVIS} ]]; then
  sh -e /etc/init.d/xvfb start
fi

$(npm bin)/karma start ./karma-js.conf.js --single-run --browsers=${KARMA_JS_BROWSERS}
echo 'travis_fold:end:test.localChrome'



echo 'travis_fold:end:test.js'
