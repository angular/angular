#!/usr/bin/env bash

# WARNING: FIREBASE_TOKEN should NOT be printed.
set +x -eu -o pipefail


FIREBASE_PROJECT_ID=aio-staging
DEPLOYED_URL=https://$FIREBASE_PROJECT_ID.firebaseapp.com

cd "`dirname $0`/.."

# Build the app
yarn build

# Deploy to staging
firebase use "$FIREBASE_PROJECT_ID" --token "$FIREBASE_TOKEN"
firebase deploy --message "Commit: $TRAVIS_COMMIT" --non-interactive --token "$FIREBASE_TOKEN"

# Run PWA-score tests
yarn test-pwa-score -- "$DEPLOYED_URL" "$MIN_PWA_SCORE_STAGING"

cd -
