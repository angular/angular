#!/usr/bin/env bash

# WARNING: FIREBASE_TOKEN should NOT be printed.
set +x -eu -o pipefail

# Only deploy if this not a PR. PRs are deployed early in `build.sh`.
if [[ $TRAVIS_PULL_REQUEST != "false" ]]; then
  echo "Skipping deploy because this is a PR build."
  exit 0
fi

# Do not deploy if the current commit is not the latest on its branch.
readonly LATEST_COMMIT=$(git ls-remote origin $TRAVIS_BRANCH | cut -c1-40)
if [[ $TRAVIS_COMMIT != $LATEST_COMMIT ]]; then
  echo "Skipping deploy because $TRAVIS_COMMIT is not the latest commit ($LATEST_COMMIT)."
  exit 0
fi

# The deployment mode is computed based on the branch we are building
if [[ $TRAVIS_BRANCH == master ]]; then
  readonly deployEnv=next
elif [[ $TRAVIS_BRANCH == $STABLE_BRANCH ]]; then
  readonly deployEnv=stable
else
  # Extract the major versions from the branches, e.g. the 4 from 4.3.x
  readonly majorVersion=${TRAVIS_BRANCH%%.*}
  readonly majorVersionStable=${STABLE_BRANCH%%.*}

  # Do not deploy if the major version is not less than the stable branch major version
  if [[ !( "$majorVersion" < "$majorVersionStable" ) ]]; then
    echo "Skipping deploy of branch \"${TRAVIS_BRANCH}\" to firebase."
    echo "We only deploy archive branches with the major version less than the stable branch: \"${STABLE_BRANCH}\""
    exit 0
  fi

  # Find the branch that has highest minor version for the given `$majorVersion`
  readonly mostRecentMinorVersion=$(
    # List the branches that start with the major version
    git ls-remote origin refs/heads/${majorVersion}.*.x |
    # Extract the version number
    awk -F'/' '{print $3}' |
    # Sort by the minor version
    sort -t. -k 2,2n |
    # Get the highest version
    tail -n1
  )

  # Do not deploy as it is not the latest branch for the given major version
  if [[ $TRAVIS_BRANCH != $mostRecentMinorVersion ]]; then
    echo "Skipping deploy of branch \"${TRAVIS_BRANCH}\" to firebase."
    echo "There is a more recent branch with the same major version: \"${mostRecentMinorVersion}\""
    exit 0
  fi

  readonly deployEnv=archive
fi

case $deployEnv in
  next)
    readonly projectId=aio-staging
    readonly deployedUrl=https://next.angular.io/
    readonly firebaseToken=$FIREBASE_TOKEN
    ;;
  stable)
    readonly projectId=angular-io
    readonly deployedUrl=https://angular.io/
    readonly firebaseToken=$FIREBASE_TOKEN
    ;;
  archive)
    readonly projectId=v${majorVersion}-angular-io
    readonly deployedUrl=https://v${majorVersion}.angular.io/
    readonly firebaseToken=$FIREBASE_TOKEN
    ;;
esac

echo "Git branch        : $TRAVIS_BRANCH"
echo "Build/deploy mode : $deployEnv"
echo "Firebase project  : $projectId"
echo "Deployment URL    : $deployedUrl"

if [[ ${1:-} == "--dry-run" ]]; then
  exit 0
fi

# Deploy
(
  cd "`dirname $0`/.."

  # Build the app
  yarn build-for $deployEnv

  # Include any mode-specific files
  cp -rf src/extra-files/$deployEnv/. dist/

  # Check payload size
  yarn payload-size

  # Deploy to Firebase
  firebase use "$projectId" --token "$firebaseToken"
  firebase deploy --message "Commit: $TRAVIS_COMMIT" --non-interactive --token "$firebaseToken"

  # Run PWA-score tests
  yarn test-pwa-score "$deployedUrl" "$MIN_PWA_SCORE"
)
