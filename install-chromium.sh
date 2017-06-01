#!/usr/bin/env bash

set -eu -o pipefail


readonly CHROMIUM_VERSION=433059
readonly ARCHITECTURE=Linux_x64
readonly CHROMIUM_DIR=.chrome/chromium
readonly CHROMIUM_BIN=$CHROMIUM_DIR/chrome-linux/chrome


TMP=$(curl -s "https://omahaproxy.appspot.com/all") || true
oldIFS="$IFS"
IFS='
'
IFS=${IFS:0:1}
lines=( $TMP )
IFS=','
for line in "${lines[@]}"
  do
    lineArray=($line);
    if [ "${lineArray[0]}" = "linux" ] && [ "${lineArray[1]}" = "stable" ] ; then
      LATEST_CHROMIUM_VERSION="${lineArray[7]}"
    fi
done
IFS="$oldIFS"
if [[ "$CHROMIUM_VERSION" != "$LATEST_CHROMIUM_VERSION" ]]; then
  echo "New version of Chromium available. Update install-chromium.sh with build number: ${LATEST_CHROMIUM_VERSION}"
fi


echo Downloading Chromium version: ${CHROMIUM_VERSION}
mkdir -p $CHROMIUM_DIR

NEXT=$CHROMIUM_VERSION
FILE="chrome-linux.zip"
STATUS=404
while [[ $STATUS == 404 && $NEXT -ge 0 ]]
do
  echo Fetch Chromium version: ${NEXT}
  STATUS=$(curl "https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/${NEXT}/${FILE}" -s -w %{http_code} --create-dirs -o $FILE) || true
  NEXT=$[$NEXT-1]
done

unzip $FILE -d $CHROMIUM_DIR
rm $FILE
