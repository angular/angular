#!/usr/bin/env bash

# WARNING: NGBUILDS_IO_KEY should NOT be printed.
set +x -eu -o pipefail
exec 3>&1


readonly INPUT_DIR=dist/
readonly OUTPUT_FILE=/tmp/snapshot.tar.gz
readonly AIO_BUILDS_DOMAIN=ngbuilds.io
readonly UPLOAD_URL=https://$AIO_BUILDS_DOMAIN/create-build/$TRAVIS_PULL_REQUEST/$TRAVIS_PULL_REQUEST_SHA

readonly SHORT_SHA=$(echo $TRAVIS_PULL_REQUEST_SHA | cut -c1-7)
readonly DEPLOYED_URL=https://pr$TRAVIS_PULL_REQUEST-$SHORT_SHA.$AIO_BUILDS_DOMAIN

readonly skipBuild=$([[ "$1" == "--skip-build" ]] && echo "true" || echo "");
readonly relevantChangedFilesCount=$(git diff --name-only $TRAVIS_COMMIT_RANGE | grep -P "^(?:aio|packages)/(?!.*[._]spec\.[jt]s$)" | wc -l)

(
  cd "`dirname $0`/.."

  # Do not deploy unless this PR has touched relevant files: `aio/` or `packages/` (except for spec files)
  if [[ $relevantChangedFilesCount -eq 0 ]]; then
    echo "Skipping deploy because this PR did not touch any relevant files."
    exit 0
  fi

  # Build the app
  if [[ "$skipBuild" != "true" ]]; then
    yarn build
  fi
  tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .
  yarn payload-size

  # Deploy to staging
  readonly output=$(
    curl --include --location --request POST --silent --write-out "\nHTTP_CODE: %{http_code}\n" \
        --header "Authorization: Token $NGBUILDS_IO_KEY" --data-binary "@$OUTPUT_FILE" "$UPLOAD_URL" \
    | sed 's/\r\n/\n/' \
    | tee /dev/fd/3
  )
  readonly isHidden=$([[ `echo $output | grep 'non-public'` ]] && echo "true" || echo "")
  readonly httpCode=$(echo "$output" | tail -1 | sed 's/HTTP_CODE: //')

  # Exit with an error if the request failed.
  # (Ignore 409 failures, which mean trying to re-deploy for the same PR/SHA.)
  if [[ $httpCode -lt 200 ]] || ([[ $httpCode -ge 400 ]] && [[ $httpCode -ne 409 ]]); then
    exit 1
  fi

  # Run PWA-score tests (unless the deployment is not public yet;
  # i.e. it could not be automatically verified).
  if [[ $httpCode -ne 202 ]] && [[ "$isHidden" != "true" ]]; then
    yarn test-pwa-score "$DEPLOYED_URL" "$MIN_PWA_SCORE"
  fi
)
