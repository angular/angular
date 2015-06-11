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

function publishModule {
  NAME=$1
  PUBLISH_DIR=$NPM_DIR/$NAME
  rm -fr $PUBLISH_DIR
  mkdir -p $PUBLISH_DIR

  mkdir -p $PUBLISH_DIR/es6/dev
  cp -r $ROOT_DIR/dist/js/es6/dev/$NAME/$FILES $PUBLISH_DIR/es6/dev
  mkdir -p $PUBLISH_DIR/es6/prod
  cp -r $ROOT_DIR/dist/js/es6/prod/$NAME/$FILES $PUBLISH_DIR/es6/prod
  mkdir -p $PUBLISH_DIR/ts
  cp -r $ROOT_DIR/modules/$NAME/$FILES $PUBLISH_DIR/ts

  cp -r $ROOT_DIR/dist/js/cjs/dev/$NAME/$FILES $PUBLISH_DIR/
  mkdir -p $PUBLISH_DIR/cjs/prod
  cp -r $ROOT_DIR/dist/js/cjs/prod/$NAME/$FILES $PUBLISH_DIR/prod

  npm publish $PUBLISH_DIR
}

publishModule angular2
publishModule benchpress
