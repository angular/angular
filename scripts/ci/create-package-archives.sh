#!/usr/bin/env bash

set -eu -o pipefail

readonly safeBranchName="$(echo $1 | sed 's/^pull\//pr/' | sed 's/[^A-Za-z0-9_.-]/_/g')"
readonly shortLastSha="$(git rev-parse --short $2)"
readonly inputDir="$PROJECT_ROOT/$3"
readonly outputDir="$PROJECT_ROOT/$4"
readonly fileSuffix="-$safeBranchName-$shortLastSha.tgz"

echo "Creating compressed archives for packages in '$inputDir'."

# Create or clean-up the output directory.
echo "  Preparing output directory: $outputDir"
rm -rf "$outputDir"
mkdir -p "$outputDir"

# If there are more than one packages in `$inputDir`...
if [[ $(ls -1 "$inputDir" | wc -l) -gt 1 ]]; then
  # Create a compressed archive containing all packages.
  # (This is useful for copying all packages into `node_modules/` (without changing `package.json`).)
  outputFileName=all$fileSuffix
  echo "  Creating archive with all packages --> '$outputFileName'..."
  tar --create --gzip --directory "$inputDir" --file "$outputDir/$outputFileName" --transform s/^\./packages/ .
fi

# Create a compressed archive for each package.
# (This is useful for referencing the path/URL to the resulting archive in `package.json`.)
for dir in $inputDir/*
do
  packageName=`basename "$dir"`
  outputFileName="$packageName$fileSuffix"
  outputFilePath="$outputDir/$outputFileName"

  echo "  Processing package '$packageName' --> '$outputFileName'..."

  tar --create --gzip --directory "$dir" --file "$outputFilePath" --transform s/^\./package/ .
done

echo "Done creating compressed archives."
