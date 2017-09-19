#!/usr/bin/env bash

readonly PROJECT_NAME="angular-payload-size"

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

# Check whether the file size is under limit
# Write to global variable $failed
# Read from global variables $size, $size7, $size9, $label, $limitUncompressed
checkSize() {
  for fileType in "uncompressed" "gzip7" "gzip9"; do
    if [[ ${size[$fileType]} -gt ${payloadLimits[$name, $fileType, $label]} ]]; then
      failed=true
      echo "$fileType $label size is ${size[$fileType]} which is greater than ${payloadLimits[$name, $fileType, $label]}"
    fi
  done
}

# Write timestamp to global variable $payloadData
addTimestamp() {
  # Add Timestamp
  timestamp=$(date +%s)
  payloadData="$payloadData\"timestamp\": $timestamp, "
}

# Write travis commit message to global variable $payloadData
addMessage() {
  # Grab the set of SHAs for the message. This can fail when you force push or do initial build
  # because $TRAVIS_COMMIT_RANGE will contain the previous SHA which will not be in the
  # force push or commit, hence we default to last commit.
  message=$(git log --oneline $TRAVIS_COMMIT_RANGE -- || git log --oneline -n1)
  message=$(echo $message | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  payloadData="$payloadData\"message\": \"$message\""
}

# Add change source: application, dependencies, or 'application+dependencies'
# Read from global variables $parentDir
# Update the change source to global variable $payloadData
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

# Upload data to firebase database if it's commit, print out data for pull
# requests
uploadData() {
  name="$1"
  payloadData="{${payloadData}}"

  echo The data for $name is:
  echo $payloadData

  if [[ "$TRAVIS_PULL_REQUEST" == "false" ]]; then
    readonly safeBranchName=$(echo $TRAVIS_BRANCH | sed -e 's/\./_/g')
    readonly dbPath=/payload/$name/$safeBranchName/$TRAVIS_COMMIT

    # WARNING: FIREBASE_TOKEN should NOT be printed.
    set +x
    $PROJECT_ROOT/node_modules/.bin/firebase database:update --data "$payloadData" --project $PROJECT_NAME --confirm --token "$ANGULAR_PAYLOAD_FIREBASE_TOKEN" $dbPath
  fi
}

# Track payload size, $1 is the name in database, $2 is the file path
# $3 is whether we check the payload size and fail the test if the size exceeds
# limit, $4 is whether record the type of changes: true | false
trackPayloadSize() {
  name="$1"
  path="$2"
  checkSize="$3"
  trackChange=$4

  payloadData=""
  failed=false
  for filename in $path; do
    declare -A size
    calculateSize
    if [[ $checkSize = true ]]; then
      checkSize
    fi
  done
  addTimestamp
  if [[ $trackChange = true ]]; then
    addChange
  fi
  addMessage
  uploadData $name
  if [[ $failed = true ]]; then
    echo exit 1
    exit 1
  fi
}
