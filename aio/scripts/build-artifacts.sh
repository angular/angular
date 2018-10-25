#!/usr/bin/env bash

set -eu -o pipefail

readonly relativeOutputPath=$1
readonly prNumber=$2
readonly prLastSha=$3
readonly inputDir=dist/
readonly outputFile=$PROJECT_ROOT/$relativeOutputPath
readonly deployedUrl=https://pr${prNumber}-${prLastSha:0:7}.ngbuilds.io/

(
  cd $PROJECT_ROOT/aio

  # Build and store the app
  yarn build --progress=false

  # Set deployedUrl as parameter in the opensearch description
  # deployedUrl must end with /
  yarn set-opensearch-url $deployedUrl

  mkdir -p "`dirname $outputFile`"
  tar --create --gzip --directory "$inputDir" --file "$outputFile" .
)
