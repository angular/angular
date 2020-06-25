#!/usr/bin/env bash

# WARNING: CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN should NOT be printed.
set +x -eu -o pipefail

# Do not deploy if we are running in a fork.
if [[ "$CI_REPO_OWNER/$CI_REPO_NAME" != "angular/angular" ]]; then
  echo "Skipping deploy because this is not angular/angular."
  exit 0
fi

# Do not deploy if this is a PR. PRs are deployed in the `aio_preview` CircleCI job.
if [[ $CI_PULL_REQUEST != "false" ]]; then
  echo "Skipping deploy because this is a PR build."
  exit 0
fi

# Do not deploy if the current commit is not the latest on its branch.
readonly latestCommit=$(git ls-remote origin $CI_BRANCH | cut -c1-40)
if [[ $CI_COMMIT != $latestCommit ]]; then
  echo "Skipping deploy because $CI_COMMIT is not the latest commit ($latestCommit)."
  exit 0
fi

# The deployment mode is computed based on the branch we are building
if [[ $CI_BRANCH == master ]]; then
  readonly deployEnv=next
elif [[ $CI_BRANCH == $CI_STABLE_BRANCH ]]; then
  readonly deployEnv=stable
else
  # Extract the major versions from the branches, e.g. the 4 from 4.3.x
  readonly majorVersion=${CI_BRANCH%%.*}
  readonly majorVersionStable=${CI_STABLE_BRANCH%%.*}

  # Do not deploy if the major version is not less than the stable branch major version
  if (( $majorVersion >= $majorVersionStable )); then
    echo "Skipping deploy of branch \"$CI_BRANCH\" to firebase."
    echo "We only deploy archive branches with the major version less than the stable branch: \"$CI_STABLE_BRANCH\""
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
  if [[ $CI_BRANCH != $mostRecentMinorVersion ]]; then
    echo "Skipping deploy of branch \"$CI_BRANCH\" to firebase."
    echo "There is a more recent branch with the same major version: \"$mostRecentMinorVersion\""
    exit 0
  fi

  readonly deployEnv=archive
fi

case $deployEnv in
  next)
    readonly projectId=aio-staging
    readonly siteId=$projectId
    readonly deployedUrl=https://next.angular.io/
    readonly firebaseToken=$CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN
    ;;
  stable)
    readonly projectId=angular-io
    readonly siteId=$projectId
    readonly deployedUrl=https://angular.io/
    readonly firebaseToken=$CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN
    ;;
  archive)
    # Special case v9-angular-io because its piloting the firebase hosting "multisites" setup
    # See https://angular-team.atlassian.net/browse/DEV-125 for more info.
    if [[ "$majorVersion" == "9" ]]; then
      readonly projectId=aio-staging
      readonly siteId=v9-angular-io
    else
      readonly projectId=v${majorVersion}-angular-io
      readonly siteId=$projectId
    fi

    readonly deployedUrl=https://v${majorVersion}.angular.io/
    readonly firebaseToken=$CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN
    ;;
esac

echo "Git branch        : $CI_BRANCH"
echo "Build/deploy mode : $deployEnv"
echo "Firebase project  : $projectId"
echo "Firebase site     : $siteId"
echo "Deployment URL    : $deployedUrl"

if [[ ${1:-} == "--dry-run" ]]; then
  exit 0
fi

# Deploy
(
  cd "`dirname $0`/.."

  echo "\n\n\n==== Build the aio app ====\n"
  yarn build --configuration=$deployEnv --progress=false


  echo "\n\n\n==== Add any mode-specific files into the aio distribution ====\n"
  cp -rf src/extra-files/$deployEnv/. dist/


  echo "\n\n\n==== Update opensearch descriptor for aio with the deployedUrl ====\n"
  # deployedUrl must end with /
  yarn set-opensearch-url $deployedUrl

  echo "\n\n\n==== Check payload size and upload the numbers to firebase db ====\n"
  yarn payload-size


  echo "\n\n\n==== Deploy aio to firebase hosting ====\n"

  yarn firebase use "${projectId}" --token "$firebaseToken"
  yarn firebase target:apply hosting aio $siteId --token "$firebaseToken"
  yarn firebase deploy --only hosting:aio --message "Commit: $CI_COMMIT" --non-interactive --token "$firebaseToken"


  echo "\n\n\n==== Run PWA-score tests ====\n"
  yarn test-pwa-score "$deployedUrl" "$CI_AIO_MIN_PWA_SCORE"
)
