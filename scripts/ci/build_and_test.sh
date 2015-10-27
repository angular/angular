#!/bin/bash
set -e

MODE=$1

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

if [ "$MODE" = "dart_experimental" ]; then
  ${SCRIPT_DIR}/build_$MODE.sh
elif [ "$MODE" = "saucelabs" ] || [ "$MODE" = "browserstack" ] ; then
  ${SCRIPT_DIR}/test_$MODE.sh
elif [ "$MODE" = "lint" ]; then
  ./node_modules/.bin/gulp static-checks
else
  ${SCRIPT_DIR}/build_$MODE.sh
  mkdir deploy; tar -czpf deploy/dist.tgz -C dist .
  ${SCRIPT_DIR}/test_$MODE.sh
fi
