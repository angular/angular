#!/usr/bin/env bash

set -eu -o pipefail

readonly PROJECT_NAME="angular-payload-size"
NODE_MODULES_BIN=$PROJECT_ROOT/node_modules/.bin/

# Get the gzip size of a file with the specified compression level.
#   $1: string - The file path.
#   $2: number - The level of compression.
getGzipSize() {
  local filePath=$1
  local compLevel=$2
  local compPath=$1$2.gz
  local size=-1

  gzip -c -$compLevel "$filePath" >> "$compPath"
  size=$(stat -c%s "$compPath")
  rm "$compPath"

  echo $size
}

# Calculate the size of target file uncompressed size, gzip7 size, gzip9 size
# Write to global variable $payloadData, $filename
calculateSize() {
  label=$(echo "$filename" | sed "s/.*\///" | sed "s/\..*//")

  payloadData="$payloadData\"uncompressed/$label\": $(stat -c%s "$filename"), "
  payloadData="$payloadData\"gzip7/$label\": $(getGzipSize "$filename" 7), "
  payloadData="$payloadData\"gzip9/$label\": $(getGzipSize "$filename" 9), "
}

# Check whether the file size is under limit.
# Exit with an error if limit is exceeded.
#   $1: string - The name in database.
#   $2: string - The payload size limit file.
checkSize() {
  name="$1"
  limitFile="$2"

  # In non-PR builds, `CI_BRANCH` is the branch being built (e.g. `pull/12345`), not the targeted branch.
  # Thus, PRs will fall back to using the size limits for `master`.
  node ${PROJECT_ROOT}/scripts/ci/payload-size.js $limitFile $name $CI_BRANCH $CI_COMMIT
}

# Write timestamp to global variable `$payloadData`.
addTimestamp() {
  # Add Timestamp
  timestamp=$(date +%s)
  payloadData="$payloadData\"timestamp\": $timestamp, "
}

# Write travis commit message to global variable `$payloadData`.
#   $1: string - The commit range for this build (in `<SHA-1>...<SHA-2>` format).
addMessage() {
  commitRange="$1"

  # Grab the set of SHAs for the message. This can fail when you force push or do initial build
  # because $CI_COMMIT_RANGE may contain the previous SHA which will not be in the
  # force push or commit, hence we default to last commit.
  message=$(git log --oneline $commitRange -- || git log --oneline -n1)
  message=$(echo $message | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  payloadData="$payloadData\"message\": \"$message\", "
}

# Add change source: `application`, `dependencies`, or `application+dependencies`
# Read from global variable `$parentDir`.
# Update the change source in global variable `$payloadData`.
#   $1: string - The commit range for this build (in `<SHA-1>...<SHA-2>` format).
addChangeType() {
  commitRange="$1"

  yarnChanged=false
  allChangedFiles=$(git diff --name-only $commitRange $parentDir | wc -l)
  allChangedFileNames=$(git diff --name-only $commitRange $parentDir)

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

# Convert the current `payloadData` value to a JSON string.
# (Basically remove trailing `,` and wrap in `{...}`.)
payloadToJson() {
  echo "{$(sed -r 's|, *$||' <<< $payloadData)}"
}

# Upload data to firebase database if it's commit, print out data for pull requests.
#   $1: string - The name in database.
uploadData() {
  name="$1"

  readonly safeBranchName=$(echo $CI_BRANCH | sed -e 's/\./_/g')
  readonly dbPath=/payload/$name/$safeBranchName/$CI_COMMIT
  readonly jsonPayload=$(payloadToJson)

  # WARNING: CI_SECRET_PAYLOAD_FIREBASE_TOKEN should NOT be printed.
  set +x
  $NODE_MODULES_BIN/firebase database:update --data "$jsonPayload" --project $PROJECT_NAME --confirm --token "$CI_SECRET_PAYLOAD_FIREBASE_TOKEN" $dbPath
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
  trackChangeType="$4"
  limitFile="${5:-}"

  payloadData=""

  # Calculate the file sizes.
  for filename in $path; do
    calculateSize
  done

  # Save the file sizes to be retrieved from `payload-size.js`.
  echo "$(payloadToJson)" > /tmp/current.log

  # If this is a non-PR build, upload the data to firebase.
  if [[ "$CI_PULL_REQUEST" == "false" ]]; then
    if [[ $trackChangeType = true ]]; then
      addChangeType $CI_COMMIT_RANGE
    fi
    addTimestamp
    addMessage $CI_COMMIT_RANGE
    uploadData $name
  fi

  # Check the file sizes against the specified limits.
  if [[ $checkSize = true ]]; then
    checkSize $name $limitFile
  fi
}
