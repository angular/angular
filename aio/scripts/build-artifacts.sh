#!/usr/bin/env bash

set -eu -o pipefail

source "`dirname $0`/../../scripts/ci/env.sh" print

readonly INPUT_DIR=dist/
readonly OUTPUT_FILE=$PROJECT_ROOT/$1
(
  cd $PROJECT_ROOT/aio

  # Build and store the app
  yarn build
  mkdir -p "`dirname $OUTPUT_FILE`"
  tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .
)
