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
Firebase project  : angular-hispano-staging
Firebase site     : angular-hispano-docs-staging
Deployment URL    : https://angular-hispano-docs-staging.web.app/"
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
Firebase project  : angular-latino
Firebase site     : angular-hispano-docs-prod
Deployment URL    : https://docs.angular.lat/"
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
