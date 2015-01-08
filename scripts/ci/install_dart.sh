#!/bin/bash

set -e

AVAILABLE_DART_VERSION=$(curl "https://storage.googleapis.com/dart-archive/channels/$CHANNEL/release/latest/VERSION" | python -c \
    'import sys, json; print(json.loads(sys.stdin.read())["version"])')

echo Fetch Dart channel: $CHANNEL

SVN_REVISION=latest
# TODO(chirayu): Remove this once issue 20896 is fixed.
# Dart 1.7.0-dev.1.0 and 1.7.0-dev.2.0 are both broken so use version
# 1.7.0-dev.0.1 instead.
if [[ "$AVAILABLE_DART_VERSION" == "1.7.0-dev.2.0" ]]; then
  SVN_REVISION=39661  # Use version 1.7.0-dev.0.1
fi

URL_PREFIX=https://storage.googleapis.com/dart-archive/channels/$CHANNEL/release/$SVN_REVISION
DART_SDK_URL="$URL_PREFIX/sdk/dartsdk-$ARCH-release.zip"
DARTIUM_URL="$URL_PREFIX/dartium/dartium-$ARCH-release.zip"

download_and_unzip() {
  ZIPFILE=${1/*\//}
  curl -O -L $1 && unzip -q $ZIPFILE && rm $ZIPFILE
}

# TODO: do these downloads in parallel
download_and_unzip $DART_SDK_URL
download_and_unzip $DARTIUM_URL

echo Fetched new dart version $(<dart-sdk/version)

if [[ -n $DARTIUM_URL ]]; then
  mv dartium-* chromium
fi
