#!/usr/bin/env bash

set -eu -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)
readonly parentDir=$(dirname $thisDir)

# Track payload size functions
source ../scripts/ci/payload-size.sh

trackPayloadSize "aio" "dist/*.js" true true "${thisDir}/_payload-limits.json"

