#!/usr/bin/env bash

# WARNING: FIREBASE_TOKEN should NOT be printed.
set +x -eu -o pipefail


readonly deployEnv=$1

case $deployEnv in
  staging)
    readonly buildEnv=stage
    readonly projectId=aio-staging
    readonly deployedUrl=https://$projectId.firebaseapp.com/
    readonly firebaseToken=$FIREBASE_TOKEN
    ;;
  production)
    readonly buildEnv=prod
    readonly projectId=angular-io
    readonly deployedUrl=https://angular.io/
    readonly firebaseToken=$FIREBASE_TOKEN
    ;;
  *)
    echo "Unknown deployment environment ('$deployEnv'). Expected 'staging' or 'production'."
    exit 1
    ;;
esac

(
  cd "`dirname $0`/.."

  # Build the app
  yarn build -- --env=$buildEnv

  # Check payload size
  yarn payload-size

  # Deploy to Firebase
  firebase use "$projectId" --token "$firebaseToken"
  firebase deploy --message "Commit: $TRAVIS_COMMIT" --non-interactive --token "$firebaseToken"

  # Run PWA-score tests
  yarn test-pwa-score -- "$deployedUrl" "$MIN_PWA_SCORE"
)
