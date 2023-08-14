#!/usr/bin/env bash

set -eu -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)
readonly parentDir=$(dirname $thisDir)
readonly target=${1:-aio}

# Track payload size functions
source ../scripts/ci/payload-size.sh

# Provide node_modules from aio
NODE_MODULES_BIN=$PROJECT_ROOT/aio/node_modules/.bin/

trackPayloadSize "$target" "../dist/bin/aio/build/*.css ../dist/bin/aio/build/*.js" true "$PROJECT_ROOT/goldens/size-tracking/aio-payloads.json"
