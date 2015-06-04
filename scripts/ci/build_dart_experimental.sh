#!/bin/bash
set -e

echo =============================================================================
echo EXPERIMENTAL DART BUILD
echo =============================================================================

# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

# TODO(yjbanov): install DDC (Dart Dev Compiler) here because it is not yet
#                bundled with the SDK.
$PUB global activate dev_compiler 0.1.0

./node_modules/.bin/gulp build/packages.dart
./node_modules/.bin/gulp build/pubspec.dart
./node_modules/.bin/gulp build/analyze.ddc.dart
