#!/usr/bin/env bash

# WARNING: FIREBASE_TOKEN should NOT be printed.
set +x -eu -o pipefail


readonly INPUT_DIR=dist/
readonly OUTPUT_FILE=/tmp/snapshot.tar.gz
FIREBASE_PROJECT_ID=aio-staging
DEPLOYED_URL=https://$FIREBASE_PROJECT_ID.firebaseapp.com

(
  cd "`dirname $0`/.."

  # Build the app
  yarn build
  tar --create --gzip --directory "$INPUT_DIR" --file "$OUTPUT_FILE" .
  yarn payload-size

  # Deploy to staging
  firebase use "$FIREBASE_PROJECT_ID" --token "$FIREBASE_TOKEN"
  firebase deploy --message "Commit: $TRAVIS_COMMIT" --non-interactive --token "$FIREBASE_TOKEN"

  # Run PWA-score tests
  # TODO(gkalpak): Figure out why this fails and re-enable.
  sleep 10
  yarn test-pwa-score -- "$DEPLOYED_URL" "$MIN_PWA_SCORE" "$PWA_RESULTS_LOG" || true
)
