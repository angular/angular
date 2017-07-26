#!/usr/bin/env bash
set +x -eu -o pipefail

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
  echo ===== master - skip deploy - pull request
  actual=$(
    export TRAVIS_PULL_REQUEST=true
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy because this is a PR build."
  check "$actual" "$expected"
)

(
  echo ===== master - deploy success
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=master
    export TRAVIS_COMMIT=$(git ls-remote origin master | cut -c-40)
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
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
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=master
    export TRAVIS_COMMIT=DUMMY_TEST_COMMIT
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ($(git ls-remote origin master | cut -c1-40))."
  check "$actual" "$expected"
)

(
  echo ===== stable - deploy success
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=4.3.x
    export STABLE_BRANCH=4.3.x
    export TRAVIS_COMMIT=$(git ls-remote origin 4.3.x | cut -c-40)
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
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
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=4.3.x
    export STABLE_BRANCH=4.3.x
    export TRAVIS_COMMIT=DUMMY_TEST_COMMIT
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ($(git ls-remote origin 4.3.x | cut -c1-40))."
  check "$actual" "$expected"
)

(
  echo ===== archive - deploy success
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=2.4.x
    export STABLE_BRANCH=4.3.x
    export TRAVIS_COMMIT=$(git ls-remote origin 2.4.x | cut -c-40)
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Git branch        : 2.4.x
Build/deploy mode : archive
Firebase project  : angular-io-2
Deployment URL    : https://v2.angular.io/"
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - commit not HEAD
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=2.4.x
    export STABLE_BRANCH=4.3.x
    export TRAVIS_COMMIT=DUMMY_TEST_COMMIT
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ($(git ls-remote origin 2.4.x | cut -c1-40))."
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - major version too high, lower minor
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=2.1.x
    export STABLE_BRANCH=2.2.x
    export TRAVIS_COMMIT=$(git ls-remote origin 2.1.x | cut -c-40)
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy of branch \"2.1.x\" to firebase.
We only deploy archive branches with the major version less than the stable branch: \"2.2.x\""
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - major version too high, higher minor
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=2.4.x
    export STABLE_BRANCH=2.2.x
    export TRAVIS_COMMIT=$(git ls-remote origin 2.4.x | cut -c-40)
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy of branch \"2.4.x\" to firebase.
We only deploy archive branches with the major version less than the stable branch: \"2.2.x\""
  check "$actual" "$expected"
)

(
  echo ===== archive - skip deploy - minor version too low
  actual=$(
    export TRAVIS_PULL_REQUEST=false
    export TRAVIS_BRANCH=2.1.x
    export STABLE_BRANCH=4.3.x
    export TRAVIS_COMMIT=$(git ls-remote origin 2.1.x | cut -c-40)
    export FIREBASE_TOKEN=XXXXX
    `dirname $0`/deploy-to-firebase.sh --dry-run
  )
  expected="Skipping deploy of branch \"2.1.x\" to firebase.
There is a more recent branch with the same major version: \"2.4.x\""
  check "$actual" "$expected"
)
