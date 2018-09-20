#!/usr/bin/env bash

set -eu -o pipefail

source "`dirname $0`/../../scripts/ci/env.sh" print

readonly INPUT_DIR=dist/
readonly OUTPUT_FILE=$PROJECT_ROOT/$1
readonly PR_NUMBER=$2
readonly PR_LAST_SHA=$3
readonly deployedUrl=https://pr${PR_NUMBER}-${PR_LAST_SHA:0:7}.ngbuilds.io/

(
  cd $PROJECT_ROOT/aio

  # Build and store the app
  yarn build

  # Set deployedUrl as parameter in the opensearch description
  # deployedUrl must end with /
  yarn set-opensearch-url $deployedUrl

  mkdir -p "`dirname $OUTPUT_FILE`"
  tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .
)
