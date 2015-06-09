#!/bin/bash
set -ex
shopt -s extglob

ROOT_DIR=$(cd $(dirname $0)/../..; pwd)
cd $ROOT_DIR

gulp clean
gulp build.js.prod build.js.dev build.js.cjs

NPM_DIR=$ROOT_DIR/dist/npm
rm -fr $NPM_DIR
FILES='!(test|e2e_test|docs)'

function publishRttsAssert {
  NAME='rtts_assert'
  PUBLISH_DIR=$NPM_DIR/$NAME
  rm -fr $PUBLISH_DIR
  mkdir -p $PUBLISH_DIR

  mkdir -p $PUBLISH_DIR/es6
  cp -r $ROOT_DIR/dist/js/prod/es6/$NAME/$FILES $PUBLISH_DIR/es6

  cp -r $ROOT_DIR/dist/js/cjs/$NAME/$FILES $PUBLISH_DIR
  npm publish $PUBLISH_DIR
}

function publishModule {
  NAME=$1
  PUBLISH_DIR=$NPM_DIR/$NAME
  rm -fr $PUBLISH_DIR
  mkdir -p $PUBLISH_DIR

  mkdir -p $PUBLISH_DIR/es6/dev
  cp -r $ROOT_DIR/dist/js/dev/es6/$NAME/$FILES $PUBLISH_DIR/es6/dev
  mkdir -p $PUBLISH_DIR/es6/prod
  cp -r $ROOT_DIR/dist/js/prod/es6/$NAME/$FILES $PUBLISH_DIR/es6/prod
  mkdir -p $PUBLISH_DIR/ts
  cp -r $ROOT_DIR/modules/$NAME/$FILES $PUBLISH_DIR/ts

  cp -r $ROOT_DIR/dist/js/cjs/$NAME/$FILES $PUBLISH_DIR

  npm publish $PUBLISH_DIR
}

publishRttsAssert
publishModule angular2
publishModule benchpress
