#!/usr/bin/env bash

set -eu -o pipefail

readonly PROJECT_NAME="angular-payload-size"
NODE_MODULES_BIN=$PROJECT_ROOT/node_modules/.bin/

# Calculate the size of target file uncompressed size, gzip7 size, gzip9 size
# Write to global variable $payloadData, $filename
calculateSize() {
  size["uncompressed"]=$(stat -c%s "$filename")
  label=$(echo "$filename" | sed "s/.*\///" | sed "s/\..*//")
  payloadData="$payloadData\"uncompressed/$label\": ${size["uncompressed"]}, "

  gzip -7 $filename -c >> "${filename}7.gz"
  size["gzip7"]=$(stat -c%s "${filename}7.gz")
  payloadData="$payloadData\"gzip7/$label\": ${size["gzip7"]}, "

  gzip -9 $filename -c >> "${filename}9.gz"
  size["gzip9"]=$(stat -c%s "${filename}9.gz")
  payloadData="$payloadData\"gzip9/$label\": ${size["gzip9"]}, "
}

# Check whether the file size is under limit.
# Exit with an error if limit is exceeded.
#   $1: string - The name in database.
#   $2: string - The payload size limit file.
checkSize() {
  name="$1"
  limitFile="$2"
  node ${PROJECT_ROOT}/scripts/ci/payload-size.js $limitFile $name $TRAVIS_BRANCH $TRAVIS_COMMIT
}

# Write timestamp to global variable `$payloadData`.
addTimestamp() {
  # Add Timestamp
  timestamp=$(date +%s)
  payloadData="$payloadData\"timestamp\": $timestamp, "
}

# Write travis commit message to global variable `$payloadData`.
addMessage() {
  # Grab the set of SHAs for the message. This can fail when you force push or do initial build
  # because $TRAVIS_COMMIT_RANGE will contain the previous SHA which will not be in the
  # force push or commit, hence we default to last commit.
  message=$(git log --oneline $TRAVIS_COMMIT_RANGE -- || git log --oneline -n1)
  message=$(echo $message | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  payloadData="$payloadData\"message\": \"$message\""
}

# Add change source: `application`, `dependencies`, or `application+dependencies`
# Read from global variable `$parentDir`.
# Update the change source in global variable `$payloadData`.
addChange() {
  yarnChanged=false
  allChangedFiles=$(git diff --name-only $TRAVIS_COMMIT_RANGE $parentDir | wc -l)
  allChangedFileNames=$(git diff --name-only $TRAVIS_COMMIT_RANGE $parentDir)

  if [[ $allChangedFileNames == *"yarn.lock"* ]]; then
    yarnChanged=true
  fi

  if [[ $allChangedFiles -eq 1 ]] && [[ "$yarnChanged" = true ]]; then
    # only yarn.lock changed
    change='dependencies'
  elif [[ $allChangedFiles -gt 1 ]] && [[ "$yarnChanged" = true ]]; then
    change='application+dependencies'
  elif [[ $allChangedFiles -gt 0 ]]; then
    change='application'
  else
    # Nothing changed in aio/
    exit 0
  fi
  payloadData="$payloadData\"change\": \"$change\", "
}

# Upload data to firebase database if it's commit, print out data for pull requests.
#   $1: string - The name in database.
uploadData() {
  name="$1"
  payloadData="{${payloadData}}"

  echo $payloadData > /tmp/current.log

  readonly safeBranchName=$(echo $TRAVIS_BRANCH | sed -e 's/\./_/g')

  if [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    readonly dbPath=/payload/$name/$safeBranchName/$TRAVIS_COMMIT

    # WARNING: FIREBASE_TOKEN should NOT be printed.
    set +x
    $NODE_MODULES_BIN/firebase database:update --data "$payloadData" --project $PROJECT_NAME --confirm --token "$ANGULAR_PAYLOAD_FIREBASE_TOKEN" $dbPath
  fi
}

# Track payload size.
#   $1: string       - The name in database.
#   $2: string       - The file path.
#   $3: true | false - Whether to check the payload size and fail the test if it exceeds limit.
#   $4: true | false - Whether to record the type of changes.
#   $5: [string]     - The payload size limit file. Only necessary if `$3` is `true`.
trackPayloadSize() {
  name="$1"
  path="$2"
  checkSize="$3"
  trackChange="$4"
  limitFile="${5:-}"

  payloadData=""

  for filename in $path; do
    declare -A size
    calculateSize
  done
  addTimestamp
  if [[ $trackChange = true ]]; then
    addChange
  fi
  addMessage
  uploadData $name
  if [[ $checkSize = true ]]; then
    checkSize $name $limitFile
  fi
}
