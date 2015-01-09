#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

./node_modules/karma/bin/karma start karma-js.conf \
        --reporters=dots \
        --browsers=$KARMA_BROWSERS --single-run
./node_modules/karma/bin/karma start karma-dart.conf \
        --reporters=dots \
        --browsers=$KARMA_BROWSERS --single-run
