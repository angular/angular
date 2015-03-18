#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

${SCRIPT_DIR}/test_unit_js.sh
# ${SCRIPT_DIR}/test_server_js.sh # JS doesn't yet have server tests
${SCRIPT_DIR}/test_e2e_js.sh
