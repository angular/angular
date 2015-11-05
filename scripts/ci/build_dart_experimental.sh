#!/bin/bash
set -ex

echo =============================================================================
echo EXPERIMENTAL DART BUILD
echo =============================================================================

# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

./node_modules/.bin/gulp build/packages.dart
./node_modules/.bin/gulp build/pubspec.dart
./node_modules/.bin/gulp build/analyze.ddc.dart
