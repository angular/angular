#!/bin/bash
set -e

MODE=$1

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

if [ "$MODE" = "dart_experimental" ]
then
  ${SCRIPT_DIR}/build_$MODE.sh
else
  ${SCRIPT_DIR}/build_$MODE.sh
  ${SCRIPT_DIR}/test_$MODE.sh
fi
