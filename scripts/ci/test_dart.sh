#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

${SCRIPT_DIR}/test_unit_dart.sh
${SCRIPT_DIR}/test_server_dart.sh
${SCRIPT_DIR}/test_e2e_dart.sh
