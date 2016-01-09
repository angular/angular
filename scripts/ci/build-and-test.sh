#!/usr/bin/env bash
set -ex

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
SCRIPT_DIR=$(dirname $0)
cd ${SCRIPT_DIR}/../..

ng build
karma start --single-run --no-auto-watch
