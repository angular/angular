#!/usr/bin/env bash

set -eu -o pipefail

# statc makes `stat -c` work on both Linux & OSX
function statc () {
  case $(uname) in
    Darwin*) format='-f%z' ;;
    *) format='-c%s' ;;
  esac

  stat ${format} $@
}

# sedr makes `sed -r` work on both Linux & OSX
function sedr () {
  case $(uname) in
    Darwin*) flag='-E' ;;
    *) flag='-r' ;;
  esac

  sed ${flag} "$@"
}

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
  size=$(statc "$compPath")
  rm "$compPath"

  echo $size
}

# Calculate the size of target file uncompressed size, gzip7 size, gzip9 size
# Write to global variable $payloadData, $filename
calculateSize() {
  label=$(echo "$filename" | sed "s/.*\///" | sed "s/\..*//")

  rawSize=$(statc $filename)
  gzip7Size=$(getGzipSize "$filename" 7)
  gzip9Size=$(getGzipSize "$filename" 9)

  # Log the sizes (for information/debugging purposes).
  printf "Size: %6d  (gzip7: %6d, gzip9: %6d)  %s\n" $rawSize $gzip7Size $gzip9Size $label

  payloadData="$payloadData\"uncompressed/$label\": $rawSize, "
  payloadData="$payloadData\"gzip7/$label\": $gzip7Size, "
  payloadData="$payloadData\"gzip9/$label\": $gzip9Size, "
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
  node ${PROJECT_ROOT}/scripts/ci/payload-size.js $limitFile $name ${CI_BRANCH:-} ${CI_COMMIT:-}
}

# Write timestamp to global variable `$payloadData`.
addTimestamp() {
  # Add Timestamp
  timestamp=$(date +%s)
  payloadData="$payloadData\"timestamp\": $timestamp, "
}

# Write the current CI build URL to global variable `$payloadData`.
# This allows mapping the data stored in the database to the CI build job that generated it, which
# might contain more info/context.
#   $1: string - The CI build URL.
addBuildUrl() {
  buildUrl="$1"
  payloadData="$payloadData\"buildUrl\": \"$buildUrl\", "
}

# Write the commit message for the current CI commit range to global variable `$payloadData`.
#   $1: string - The commit range for this build (in `<SHA-1>...<SHA-2>` format).
addMessage() {
  commitRange="$1"

  # Grab the set of SHAs for the message. This can fail when you force push or do initial build
  # because $CI_COMMIT_RANGE may contain the previous SHA which will not be in the
  # force push or commit, hence we default to last commit.
  message=$(git --git-dir ${PROJECT_ROOT}/.git log --oneline $commitRange -- || git --git-dir ${PROJECT_ROOT}/.git log --oneline -n1)
  message=$(echo $message | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
  payloadData="$payloadData\"message\": \"$message\", "
}

# Convert the current `payloadData` value to a JSON string.
# (Basically remove trailing `,` and wrap in `{...}`.)
payloadToJson() {
  echo "{$(sedr 's|, *$||' <<< $payloadData)}"
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
#   $4: [string]     - The payload size limit file. Only necessary if `$3` is `true`.
trackPayloadSize() {
  name="$1"
  path="$2"
  checkSize="$3"
  limitFile="${4:-}"

  payloadData=""

  # Calculate the file sizes.
  echo "Calculating sizes for files in '$path'..."
  for filename in $path; do
    calculateSize
  done

  # Save the file sizes to be retrieved from `payload-size.js`.
  echo "$(payloadToJson)" > /tmp/current.log

  # If this is a non-PR build, upload the data to firebase.
  if [[ "${CI_PULL_REQUEST:-}" == "false" ]]; then
    echo "Uploading data for '$name'..."
    addTimestamp
    addBuildUrl $CI_BUILD_URL
    addMessage $CI_COMMIT_RANGE
    uploadData $name
  else
    echo "Skipped uploading data for '$name', because this is a pull request."
  fi

  # Check the file sizes against the specified limits.
  if [[ $checkSize = true ]]; then
    echo "Verifying sizes against '$limitFile'..."
    checkSize $name $limitFile
  else
    echo "Skipped verifying sizes (checkSize: false)."
  fi
}
