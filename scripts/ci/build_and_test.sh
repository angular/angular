#!/bin/bash
set -e

MODE=$1

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

if [ "$MODE" = "dart_experimental" ]; then
  ${SCRIPT_DIR}/build_$MODE.sh
elif [ "$MODE" = "saucelabs" ]; then
  ${SCRIPT_DIR}/test_$MODE.sh
elif [ "$MODE" = "lint" ]; then
  ./node_modules/.bin/gulp static-checks
elif [ "$MODE" = "build_only" ]; then
  ${SCRIPT_DIR}/build_js.sh
  ${SCRIPT_DIR}/build_dart.sh
  mkdir deploy; tar -czpf deploy/dist.tgz -C dist .
else
  ${SCRIPT_DIR}/build_$MODE.sh
  ${SCRIPT_DIR}/test_$MODE.sh
fi
