#!/bin/bash
set -ex

echo =============================================================================
echo EXPERIMENTAL DART BUILD
echo =============================================================================

# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

# Variables
DDC_WARNING_CAP="260"
DDC_DIR=`pwd`/tmp/dev_compiler
DDC_VERSION="0.1.14"

# Get DDC
mkdir -p tmp
rm -rf tmp/dev_compiler
git clone https://github.com/dart-lang/dev_compiler.git tmp/dev_compiler
(cd $DDC_DIR && \
  git checkout tags/$DDC_VERSION && \
  $PUB get)

# Convert TypeScript to Dart
./node_modules/.bin/gulp build/packages.dart
./node_modules/.bin/gulp build/pubspec.dart
node ./scripts/ci/dart_experimental/pubspec_for_ddc.js \
    --pubspec-file=dist/dart/playground/pubspec.yaml

# Compile playground
cd dist/dart/playground
$PUB build --mode=debug
cd build/web
LOG_FILE="analyzer.log"
set +e
$DART_SDK/bin/dart $DDC_DIR/bin/dartdevc.dart \
  --dart-sdk=$DART_SDK_LIB_SEARCH_PATH -o out src/hello_world/index.dart \
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
WARNING_COUNT=`cat $LOG_FILE | wc -l | sed -e 's/^[[:space:]]*//'`

if [[ "$WARNING_COUNT" -gt "$DDC_WARNING_CAP" ]]
then
  echo "Too many warnings: $WARNING_COUNT"
  exit 1
else
  echo "Warning count ok"
fi
