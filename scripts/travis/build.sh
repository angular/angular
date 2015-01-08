#!/bin/bash
set -e

echo =============================================================================
# go to project dir
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/../..
source ./scripts/env.sh

./node_modules/.bin/gulp build

pub install
