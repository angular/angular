#!/bin/bash

readonly TOKEN=$ANGULAR_PAYLOAD_FIREBASE_TOKEN
readonly PROJECT_NAME="angular-payload-size"
readonly OUTPUT_FILE=/tmp/snapshot.tar.gz

failed=false
payloadData=""
for filename in dist/*.js.map; do
  size=$(stat -c%s "$filename")
  label=$(echo "$filename" | sed "s/.*\///" | sed "s/\..*//")
  payloadData="$payloadData\"uncompressed/$label\": $size, "

  # The size limit of each package is saved in /limit/$filename
  expect=$(firebase database:get --project $PROJECT_NAME /limit/$label)

  gzip -7 -k -f $filename
  size7=$(stat -c%s "$filename.gz")
  payloadData="$payloadData\"gzip7/$label\": $size7, "

  gzip -9 -k -f $filename
  size9=$(stat -c%s "$filename.gz")
  payloadData="$payloadData\"gzip9/$label\": $size9, "

  # Fail the bulid if size exceeds limit
  if [[ -z $expect ]]; then
    if [ $size -gt $expect ]; then
      failed=true
    fi
  fi
done

label="gzip"
size=$(stat -c%s "$OUTPUT_FILE")
payloadData="$payloadData\"$label\": $size"
payloadData="{${payloadData}}"

echo $payloadData

if [[ $TRAVIS_PULL_REQUEST == "false" ]]; then
  # Save data to /yyyy-mm-yy/commit#
  date=`date +%Y-%m-%d`
  firebase database:update --data "$payloadData" --project $PROJECT_NAME --confirm --token "$TOKEN" /payload/$date/$TRAVIS_COMMIT
fi

if [ $failed = true ]; then
  exit 1
fi
