#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

./node_modules/.bin/gulp test.transpiler.unittest
./node_modules/.bin/gulp docs/test
./node_modules/.bin/gulp test.unit.js/ci --browsers=$KARMA_BROWSERS
