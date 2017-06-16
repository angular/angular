#!/bin/bash

set -e -o pipefail

readonly TOKEN=${ANGULAR_PAYLOAD_FIREBASE_TOKEN:-}
readonly PROJECT_NAME="angular-payload-size"

source scripts/_payload-limits.sh

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

# Also track sizes of bundle/*umd.min.js files
for filename in node_modules/@angular/*/bundles/*.umd.min.js; do
  size=$(stat -c%s "$filename")
  label=$(echo "$filename" | sed "s/.*\///" | sed "s/\..*//")
  payloadData="$payloadData\"umd/$label\": $size, "
done

# Add Timestamp
timestamp=$(date +%s)
payloadData="$payloadData\"timestamp\": $timestamp, "

echo $TRAVIS_COMMIT_RANGE
# Add change source: application, dependencies, or 'application+dependencies'
allChangedFiles=$(git diff --name-only $TRAVIS_COMMIT_RANGE)
echo $allChangedFiles
yarnChangedFiles=$(git diff --name-only $TRAVIS_COMMIT_RANGE | grep yarn.lock)
echo $yarnChangedFiles

if [[ ! -z $allChangedFiles ]] && [[ ! -z $yarnChangedFiles ]] && [ "$allChangedFiles" != "$yarnChangedFiles" ]; then
  change='application+dependencies'
elif [[ ! -z $yarnChangedFiles ]]; then
  change='dependencies'
elif [[ ! -z $allChangedFiles ]]; then
  change='application'
else
  change=''
fi
payloadData="$payloadData\"change\": \"$change\""

payloadData="{${payloadData}}"

echo $payloadData

if [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
  firebase database:update --data "$payloadData" --project $PROJECT_NAME --confirm --token "$TOKEN" /payload/aio/$TRAVIS_COMMIT
fi

if [[ $failed = true ]]; then
  exit 1
fi
