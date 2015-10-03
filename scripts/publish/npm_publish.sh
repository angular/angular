#!/bin/bash
set -ex
shopt -s extglob

ROOT_DIR=$(cd $(dirname $0)/../..; pwd)
cd $ROOT_DIR

gulp clean
# benchpress.bundle and bundles.js will implicitly build everything we need
gulp benchpress.bundle bundles.js docs/typings

NPM_DIR=$ROOT_DIR/dist/npm
rm -fr $NPM_DIR
FILES='!(test|e2e_test|docs)'
DTS_FILES='*.d.ts'

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

  if [ $NAME = "angular2" ]; then
    # Publish bundles and typings
    mkdir -p $PUBLISH_DIR/bundles/typings/angular2
    mkdir -p $PUBLISH_DIR/bundles/typings/es6-shim
    mkdir -p $PUBLISH_DIR/bundles/typings/jasmine
    # Copy Bundles
    cp -r $ROOT_DIR/dist/js/bundle/$FILES $PUBLISH_DIR/bundles
    # Copy Typings
    cp -r $ROOT_DIR/dist/docs/typings/angular2/$DTS_FILES $PUBLISH_DIR/bundles/typings/angular2
    cp -r $ROOT_DIR/modules/angular2/typings/es6-shim/$DTS_FILES $PUBLISH_DIR/bundles/typings/es6-shim
    cp -r $ROOT_DIR/modules/angular2/typings/jasmine/$DTS_FILES $PUBLISH_DIR/bundles/typings/jasmine
  fi

  if [ $NAME = "benchpress" ]; then
    cp -r $ROOT_DIR/dist/build/benchpress_bundle/$FILES $PUBLISH_DIR
    cp -r $ROOT_DIR/dist/js/cjs/benchpress/README.md $PUBLISH_DIR
    cp -r $ROOT_DIR/dist/js/cjs/benchpress/LICENSE $PUBLISH_DIR
    cp -r $ROOT_DIR/dist/js/cjs/benchpress/docs $PUBLISH_DIR
  else
    cp -r $ROOT_DIR/dist/js/cjs/$NAME/$FILES $PUBLISH_DIR
  fi

  npm publish $PUBLISH_DIR
}

publishModule angular2
publishModule benchpress
