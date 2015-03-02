#!/bin/bash

# Publishes Angular 2 packages to pub.

set -ex
shopt -s extglob

ROOT_DIR=$(cd $(dirname $0)/../..; pwd)
cd $ROOT_DIR

gulp clean
gulp build/packages.dart
gulp build/analyze.dart

PKG_DIR=$ROOT_DIR/dist/pub
rm -fr $PKG_DIR
FILES='!(e2e_test|pubspec.lock)'

function publishModule {
  NAME=$1
  PUBLISH_DIR=$PKG_DIR/$NAME
  rm -fr $PUBLISH_DIR
  mkdir -p $PUBLISH_DIR

  cp -RP $ROOT_DIR/dist/dart/$NAME/$FILES $PUBLISH_DIR

  node scripts/publish/pubspec_cleaner.js --pubspec-file=$PUBLISH_DIR/pubspec.yaml

  (cd $PUBLISH_DIR && pub publish)
}

publishModule angular2
publishModule benchpress
