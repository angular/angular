#!/usr/bin/env bash

set -eux -o pipefail


INPUT_DIR=dist/
OUTPUT_FILE=/tmp/snapshot.tar.gz
AIO_BUILDS_HOST=https://ngbuilds.io

cd "`dirname $0`/.."
yarn run build -- --prod
tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .
curl -iLX POST --header "Authorization: Token $NGBUILDS_IO_KEY" --data-binary "@$OUTPUT_FILE" \
  "$AIO_BUILDS_HOST/create-build/$TRAVIS_PULL_REQUEST/$TRAVIS_COMMIT"
cd -
