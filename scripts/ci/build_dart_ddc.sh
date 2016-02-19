#!/bin/bash
set -ex

echo =============================================================================
echo "DART DEV COMPILER (DDC) BUILD"
echo =============================================================================

# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

# Variables
DDC_TOTAL_WARNING_CAP="210"
DDC_TOTAL_ERROR_CAP="0"
DDC_DIR=`pwd`/tmp/dev_compiler
DDC_VERSION="0.1.20"

# Get DDC
mkdir -p tmp
rm -rf tmp/dev_compiler
git clone https://github.com/dart-lang/dev_compiler.git tmp/dev_compiler
(cd $DDC_DIR && \
  git checkout tags/$DDC_VERSION && \
  $PUB get)

# Convert TypeScript to Dart
./node_modules/.bin/gulp build/packages.dart
./node_modules/.bin/gulp build.dart.material.css
./node_modules/.bin/gulp build/pubspec.dart
node ./scripts/ci/dart_ddc/pubspec_for_ddc.js \
    --pubspec-file=dist/dart/playground/pubspec.yaml

# Compile playground
cd dist/dart/playground
$PUB build --mode=debug
cd build/web
LOG_FILE="analyzer.log"
set +e
$DART_SDK/bin/dart $DDC_DIR/bin/dartdevc.dart \
  --dart-sdk=$DART_SDK_LIB_SEARCH_PATH -o out \
  src/animate/index.dart \
  src/async/index.dart \
  src/gestures/index.dart \
  src/hash_routing/index.dart \
  src/hello_world/index.dart \
  src/key_events/index.dart \
  src/material/button/index.dart \
  src/material/checkbox/index.dart \
  src/material/dialog/index.dart \
  src/material/grid_list/index.dart \
  src/material/input/index.dart \
  src/material/progress-linear/index.dart \
  src/material/radio/index.dart \
  src/material/switcher/index.dart \
  src/model_driven_forms/index.dart \
  src/observable_models/index.dart \
  src/order_management/index.dart \
  src/person_management/index.dart \
  src/relative_assets/index.dart \
  src/routing/index.dart \
  src/sourcemap/index.dart \
  src/svg/index.dart \
  src/template_driven_forms/index.dart \
  src/todo/index.dart \
  src/zippy_component/index.dart \
  >$LOG_FILE
EXIT_CODE=`echo $?`
set -e

# Analyzer exits with 1 when there are warnings and something crazy
# like 255 when it crashes. We don't want to fail the build if its
# only warnings (until our code is warning-free).
if [[ "$EXIT_CODE" -ne "0" && "$EXIT_CODE" -ne "1" ]]
then
  echo "DDC compiler crashed with exit code $EXIT_CODE"
  exit 1
fi

cat $LOG_FILE
EXIT_CODE=0

# TODO remove  `grep -v template.dart` after Tobias new compiler lands.

WARNING_COUNT=$(cat $LOG_FILE | grep -E '^warning.*' | grep -v template.dart | wc -l | sed -e 's/^[[:space:]]*//' || true)
ERROR_COUNT=$(cat $LOG_FILE | grep -E '^severe.*' | wc -l | sed -e 's/^[[:space:]]*//' || true)


if [[ "$ERROR_COUNT" -gt "$DDC_TOTAL_ERROR_CAP" ]]
then
  echo "Found severe errors in angular2 package"
  EXIT_CODE=1
fi

if [[ "$WARNING_COUNT" -gt "$DDC_TOTAL_WARNING_CAP" ]]
then
  echo "Too many warnings: $WARNING_COUNT"
  EXIT_CODE=1
else
  echo "Warning count ok"
fi

echo 'Dart DDC build finished'
exit $EXIT_CODE
