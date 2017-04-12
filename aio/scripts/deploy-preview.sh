#!/usr/bin/env bash

# WARNING: NGBUILDS_IO_KEY should NOT be printed.
set +x -eu -o pipefail


INPUT_DIR=dist/
OUTPUT_FILE=/tmp/snapshot.tar.gz
AIO_BUILDS_HOST=https://ngbuilds.io
UPLOAD_URL=$AIO_BUILDS_HOST/create-build/$TRAVIS_PULL_REQUEST/$TRAVIS_PULL_REQUEST_SHA

cd "`dirname $0`/.."

yarn run build
tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .

exec 3>&1
httpCode=$(
  curl --include --location --request POST --silent --write-out "\nHTTP_CODE: %{http_code}\n" \
       --header "Authorization: Token $NGBUILDS_IO_KEY" --data-binary "@$OUTPUT_FILE" "$UPLOAD_URL" \
  | sed 's/\r\n/\n/' \
  | tee /dev/fd/3 \
  | tail -1 \
  | sed 's/HTTP_CODE: //'
)

# Exit with an error if the request failed.
# (Ignore 409 failures, which mean trying to re-deploy for the same PR/SHA.)
if [ $httpCode -lt 200 ] || ([ $httpCode -ge 400 ] && [ $httpCode -ne 409 ]); then
  exit 1
fi

cd -
