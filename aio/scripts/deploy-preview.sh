#!/usr/bin/env bash

# WARNING: NGBUILDS_IO_KEY should NOT be printed.
set +x -eu -o pipefail
exec 3>&1


readonly INPUT_DIR=dist/
readonly OUTPUT_FILE=/tmp/snapshot.tar.gz
readonly AIO_BUILDS_DOMAIN=ngbuilds.io
readonly UPLOAD_URL=https://$AIO_BUILDS_DOMAIN/create-build/$TRAVIS_PULL_REQUEST/$TRAVIS_PULL_REQUEST_SHA
readonly DEPLOYED_URL=https://pr$TRAVIS_PULL_REQUEST-$TRAVIS_PULL_REQUEST_SHA.$AIO_BUILDS_DOMAIN
readonly PREVERIFY_SCRIPT=aio-builds-setup/scripts/travis-preverify-pr.sh

readonly skipBuild=$([[ "$1" == "--skip-build" ]] && echo "true" || echo "");
readonly relevantChangedFilesCount=$(git diff --name-only $TRAVIS_COMMIT_RANGE | grep -P "^(?:aio|packages)/(?!.*[._]spec\.[jt]s$)" | wc -l)

(
  cd "`dirname $0`/.."

  # Do not deploy unless this PR has touched relevant files: `aio/` or `packages/` (except for spec files)
  if [[ $relevantChangedFilesCount -eq 0 ]]; then
    echo "Skipping deploy because this PR did not touch any relevant files."
    exit 0
  fi

  # Do not deploy unless this PR meets certain preconditions.
  readonly preverifyExitCode=$($PREVERIFY_SCRIPT > /dev/fd/3 && echo 0 || echo $?)
  case $preverifyExitCode in
    0)
      # Preconditions met: Deploy
      ;;
    1)
      # An error occurred: Fail the script
      exit 1
      ;;
    2)
      # Preconditions not met: Skip deploy
      echo "Skipping deploy because this PR did not meet the preconditions."
      exit 0
      ;;
    *)
      # Unexpected exit code: Fail the script
      echo "Unexpected pre-verification exit code: $preverifyExitCode"
      exit 1
      ;;
  esac

  # Build the app
  if [ "$skipBuild" != "true" ]; then
    yarn build
  fi
  tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .

  # Deploy to staging
  readonly httpCode=$(
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

  # Run PWA-score tests
  yarn test-pwa-score -- "$DEPLOYED_URL" "$MIN_PWA_SCORE"
)
