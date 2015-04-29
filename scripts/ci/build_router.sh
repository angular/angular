#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
# this is needed because we're running JS tests in Dartium too
source $SCRIPT_DIR/env_dart.sh
cd $SCRIPT_DIR/../..

node modules/angular1_router/build.js
