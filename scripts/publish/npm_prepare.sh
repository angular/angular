#!/bin/bash

# This script prepares build artifacts for upload to NPM.
#
# Usage:
#
# scripts/publish/npm_prepare.sh PACKAGE_NAME

set -ex
shopt -s extglob

NAME=$1
ROOT_DIR=$(cd $(dirname $0)/../..; pwd)
cd $ROOT_DIR

NPM_DIR=$ROOT_DIR/dist/npm
rm -fr $NPM_DIR
FILES='!(test|e2e_test|docs)'
DTS_FILES='*.d.ts'

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
  mkdir -p $PUBLISH_DIR/bundles/typings/es6-shim
  mkdir -p $PUBLISH_DIR/bundles/typings/jasmine
  # Copy Bundles
  cp -r $ROOT_DIR/dist/js/bundle/$FILES $PUBLISH_DIR/bundles
  # Copy Typings
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

# Remove all dart related files
rm -f $PUBLISH_DIR/{,**/}{*.dart,*.dart.md}
