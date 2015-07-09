#!/bin/bash
set -e

MODE=$1

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..

${SCRIPT_DIR}/build_$MODE.sh
mkdir deploy; tar -czpf deploy/dist.tgz -C dist .
${SCRIPT_DIR}/test_$MODE.sh
