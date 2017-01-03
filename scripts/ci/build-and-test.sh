#!/usr/bin/env bash
set -ex

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Include sources.
source scripts/ci/sources/mode.sh
source scripts/ci/sources/tunnel.sh

start_tunnel

wait_for_tunnel
if is_lint; then
  $(npm bin)/gulp ci:lint
elif is_e2e; then
  $(npm bin)/gulp ci:e2e
elif is_aot; then
  $(npm bin)/gulp ci:aot
elif is_payload; then
  $(npm bin)/gulp ci:payload
else
  $(npm bin)/gulp ci:test
fi
teardown_tunnel
