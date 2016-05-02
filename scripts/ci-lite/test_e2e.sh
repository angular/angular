#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "e2e" ]]; then
  exit 0;
fi


echo 'travis_fold:start:test.js'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..


echo 'travis_fold:start:test.buildPackages'

./build.sh

echo 'travis_fold:end:test.buildPackages'


echo 'travis_fold:start:test.e2e.localChrome'
cd dist/
python -m SimpleHTTPServer 7777 &
cd ..
if [[ ${TRAVIS} ]]; then
  sh -e /etc/init.d/xvfb start
fi
NODE_PATH=$NODE_PATH:./dist/all $(npm bin)/protractor ./protractor-js-new-world.conf.js
echo 'travis_fold:end:test.e2e.localChrome'



echo 'travis_fold:end:test.js'
