#!/usr/bin/env bash

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Include sources.
source scripts/ci/sources/mode.sh
source scripts/ci/sources/tunnel.sh

# Setup environment.
is_dart && source scripts/ci/sources/env_dart.sh

start_tunnel
npm run build
is_dart && pub install

wait_for_tunnel
if is_dart; then
  npm run dartanalyzer
else
  karma start test/karma.conf.js --single-run --no-auto-watch --reporters='dots'
fi
teardown_tunnel

