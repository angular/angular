#!/bin/bash

set -eu -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)
readonly parentDir=$(dirname $thisDir)

# Track payload size functions
source ../scripts/ci/payload-size.sh
source ${thisDir}/_payload-limits.sh

trackPayloadSize "aio" "dist/*.bundle.js" true true

