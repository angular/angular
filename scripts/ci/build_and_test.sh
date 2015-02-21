#!/bin/bash
set -e

MODE=$1

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

${SCRIPT_DIR}/build_$MODE.sh
${SCRIPT_DIR}/test_unit_$MODE.sh
if [ "$MODE" == "dart" ]; then # JS doesn't yet have server tests
  ${SCRIPT_DIR}/test_server_$MODE.sh
fi
${SCRIPT_DIR}/test_e2e_$MODE.sh
