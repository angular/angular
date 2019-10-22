#!/usr/bin/env bash

set -eu -o pipefail

readonly prNumber="$1"
readonly prLastSha="${2:0:7}"
readonly inputDir="$PROJECT_ROOT/$3"
readonly outputDir="$PROJECT_ROOT/$4"
readonly fileSuffix="-pr$prNumber-$prLastSha.tgz"

# Create or clean-up the output directory.
rm -rf "$outputDir"
mkdir -p "$outputDir"

# Create a compressed archive containing all packages.
# (This is useful for copying all packages into `node_modules/` (without changing `package.json`).)
tar --create --gzip --directory "$inputDir" --file "$outputDir/all$fileSuffix" --transform s/^\./packages/ .

# Create a compressed archive for each package.
# (This is useful for referencing the path/URL to the resulting archive in `package.json`.)
for dir in $inputDir/*
do
  packageName=`basename "$dir"`
  outputFile="$outputDir/$packageName$fileSuffix"

  echo "Processing package '$packageName'..."

  tar --create --gzip --directory "$dir" --file "$outputFile" --transform s/^\./package/ .
done
