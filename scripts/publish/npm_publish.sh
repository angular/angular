#!/bin/bash
set -ex

ROOT_DIR=$(cd $(dirname $0)/../..; pwd)
cd $ROOT_DIR
gulp clean
gulp build.js.prod build.js.dev

function angular {
  CHANNEL=$1
  cd $ROOT_DIR/dist/js/$CHANNEL/es6/angular2
  rm -fr test
  npm publish ./ --tag "ng2$CHANNEL"
}

function rttsAssert {
  cd $ROOT_DIR/dist/js/prod/es6/rtts_assert
  rm -fr test
  npm publish ./
}

# only publish dev version of benchpress
# as implementation is not performance sensitive
function benchpress {
  cd $ROOT_DIR/dist/js/dev/es6/benchpress
  rm -fr test
  npm publish ./
}

rttsAssert
angular dev
angular prod
benchpress