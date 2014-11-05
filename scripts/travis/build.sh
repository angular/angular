#!/bin/bash

set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..
source ./scripts/env.sh

# For some reason, this task fails on Travis when run as a part of the `gulp build`.
# It runs `pub get` which fails to read the `pubspec.yml` (created earlier by the task).
./node_modules/.bin/gulp modules/build.dart/pubspec

./node_modules/.bin/gulp build

pub install

./node_modules/karma/bin/karma start karma-js.conf \
        --reporters=dots \
        --browsers=$BROWSERS --single-run
./node_modules/karma/bin/karma start karma-dart.conf \
        --reporters=dots \
        --browsers=$BROWSERS --single-run