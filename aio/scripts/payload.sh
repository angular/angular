#!/bin/bash

set -eu -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)
readonly parentDir=$(dirname $thisDir)
readonly PROJECT_NAME="angular-payload-size"

source ${thisDir}/_payload-limits.sh

failed=false
payloadData=""
for filename in dist/*.bundle.js; do
  size=$(stat -c%s "$filename")
  label=$(echo "$filename" | sed "s/.*\///" | sed "s/\..*//")
  payloadData="$payloadData\"uncompressed/$label\": $size, "


  gzip -7 $filename -c >> "${filename}7.gz"
  size7=$(stat -c%s "${filename}7.gz")
  payloadData="$payloadData\"gzip7/$label\": $size7, "

  gzip -9 $filename -c >> "${filename}9.gz"
  size9=$(stat -c%s "${filename}9.gz")
  payloadData="$payloadData\"gzip9/$label\": $size9, "

  if [[ $size -gt ${limitUncompressed[$label]} ]]; then
    failed=true
    echo "Uncompressed $label size is $size which is greater than ${limitUncompressed[$label]}"
  elif [[ $size7 -gt ${limitGzip7[$label]} ]]; then
    failed=true
    echo "Gzip7 $label size is $size7 which is greater than ${limitGzip7[$label]}"
  elif [[ $size9 -gt ${limitGzip9[$label]} ]]; then
    failed=true
    echo "Gzip9 $label size is $size9 which is greater than ${limitGzip9[$label]}"
  fi
done

# Add Timestamp
timestamp=$(date +%s)
payloadData="$payloadData\"timestamp\": $timestamp, "

# Add change source: application, dependencies, or 'application+dependencies'
applicationChanged=false
dependenciesChanged=false
if [[ $(git diff --name-only $TRAVIS_COMMIT_RANGE $parentDir | grep -v aio/yarn.lock | grep -v content) ]]; then
  applicationChanged=true
fi
if [[ $(git diff --name-only $TRAVIS_COMMIT_RANGE $parentDir/yarn.lock) ]]; then
  dependenciesChanged=true
fi

if $dependenciesChanged && $applicationChanged; then
  change='application+dependencies'
elif $dependenciesChanged; then
  # only yarn.lock changed
  change='dependencies'
elif $applicationChanged; then
  change='application'
else
  # Nothing changed in aio/
  exit 0
fi
message=$(echo $TRAVIS_COMMIT_MESSAGE | sed 's/"/\\"/g' | sed 's/\\/\\\\/g')
payloadData="$payloadData\"change\": \"$change\", \"message\": \"$message\""

payloadData="{${payloadData}}"

echo $payloadData

if [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
  readonly safeBranchName=$(echo $TRAVIS_BRANCH | sed -e 's/\./_/g')
  readonly dbPath=/payload/aio/$safeBranchName/$TRAVIS_COMMIT

  # WARNING: FIREBASE_TOKEN should NOT be printed.
  set +x
  firebase database:update --data "$payloadData" --project $PROJECT_NAME --confirm --token "$ANGULAR_PAYLOAD_FIREBASE_TOKEN" $dbPath
fi

if [[ $failed = true ]]; then
  exit 1
fi
