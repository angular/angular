#!/usr/bin/env bash

set -eu -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)
readonly parentDir=$(dirname $thisDir)

# Track payload size functions
source ../scripts/ci/payload-size.sh

# Provide node_modules from aio
NODE_MODULES_BIN=$PROJECT_ROOT/aio/node_modules/.bin/

trackPayloadSize "aio" "dist/*.js" true true "${thisDir}/_payload-limits.json"

