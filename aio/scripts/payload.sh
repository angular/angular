#!/usr/bin/env bash

set -eu -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)
readonly parentDir=$(dirname $thisDir)
readonly target=${1:-aio}
readonly PROJECT_ROOT=$(realpath "$(dirname ${thisDir})/..")


echo "Payload checks are disabled now as we no longe publish to this branch"
exit 0
