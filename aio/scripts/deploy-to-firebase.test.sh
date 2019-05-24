#!/usr/bin/env bash
set +x -eu -o pipefail

readonly deployToFirebaseDryRun="`dirname $0`/deploy-to-firebase.sh --dry-run"

function check {
  if [[ $1 == $2 ]]; then
    echo Pass
    exit 0
  fi
  echo Fail
  echo ---- Expected ----
  echo "$2"
  echo ---- Actual   ----
  echo "$1"
  exit 1
}

(
  echo ===== master - skip deploy - not angular
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=notangular
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy because this is not angular/angular."
  check "$actual" "$expected"
)

(
  echo ===== master - skip deploy - angular fork
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=notangular
    export CI_REPO_NAME=angular
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy because this is not angular/angular."
  check "$actual" "$expected"
)

(
  echo ===== master - skip deploy - pull request
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=true
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy because this is a PR build."
  check "$actual" "$expected"
)

(
  echo ===== master - deploy success
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=master
    export CI_COMMIT=$(git ls-remote origin master | cut -c1-40)
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Git branch        : master
Build/deploy mode : next
Firebase project  : aio-staging
Deployment URL    : https://next.angular.io/"
  check "$actual" "$expected"
)

(
  echo ===== master - skip deploy - commit not HEAD
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=master
    export CI_COMMIT=DUMMY_TEST_COMMIT
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ($(git ls-remote origin master | cut -c1-40))."
  check "$actual" "$expected"
)

(
  echo ===== stable - deploy success
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=4.3.x
    export CI_STABLE_BRANCH=4.3.x
    export CI_COMMIT=$(git ls-remote origin 4.3.x | cut -c1-40)
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Git branch        : 4.3.x
Build/deploy mode : stable
Firebase project  : angular-io
Deployment URL    : https://angular.io/"
  check "$actual" "$expected"
)

(
  echo ===== stable - skip deploy - commit not HEAD
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=4.3.x
    export CI_STABLE_BRANCH=4.3.x
    export CI_COMMIT=DUMMY_TEST_COMMIT
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ($(git ls-remote origin 4.3.x | cut -c1-40))."
  check "$actual" "$expected"
)

(
  echo ===== archive - deploy success
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=2.4.x
    export CI_STABLE_BRANCH=4.3.x
    export CI_COMMIT=$(git ls-remote origin 2.4.x | cut -c1-40)
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Git branch        : 2.4.x
Build/deploy mode : archive
Firebase project  : v2-angular-io
Deployment URL    : https://v2.angular.io/"
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - commit not HEAD
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=2.4.x
    export CI_STABLE_BRANCH=4.3.x
    export CI_COMMIT=DUMMY_TEST_COMMIT
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ($(git ls-remote origin 2.4.x | cut -c1-40))."
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - major version too high, lower minor
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=2.1.x
    export CI_STABLE_BRANCH=2.2.x
    export CI_COMMIT=$(git ls-remote origin 2.1.x | cut -c-40)
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy of branch \"2.1.x\" to firebase.
We only deploy archive branches with the major version less than the stable branch: \"2.2.x\""
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - major version too high, higher minor
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=2.4.x
    export CI_STABLE_BRANCH=2.2.x
    export CI_COMMIT=$(git ls-remote origin 2.4.x | cut -c-40)
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy of branch \"2.4.x\" to firebase.
We only deploy archive branches with the major version less than the stable branch: \"2.2.x\""
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - minor version too low
  actual=$(
    export BASH_ENV=/dev/null
    export CI_REPO_OWNER=angular
    export CI_REPO_NAME=angular
    export CI_PULL_REQUEST=false
    export CI_BRANCH=2.1.x
    export CI_STABLE_BRANCH=4.3.x
    export CI_COMMIT=$(git ls-remote origin 2.1.x | cut -c-40)
    export CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN=XXXXX
    $deployToFirebaseDryRun
  )
  expected="Skipping deploy of branch \"2.1.x\" to firebase.
There is a more recent branch with the same major version: \"2.4.x\""
  check "$actual" "$expected"
)
