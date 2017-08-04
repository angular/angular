#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# If the previous commands in the `script` section of .travis.yaml failed, then abort.
# The variable is not set in early stages of the build, so we default to 0 there.
# https://docs.travis-ci.com/user/environment-variables/
if [[ ${TRAVIS_TEST_RESULT=0} == 1 ]]; then
  exit 1;
fi

# No build needed for bazel or aio docs tests
if [[ ${CI_MODE:-} == "bazel" || ${CI_MODE:-} == "docs_test" ]]; then
  exit 0;
fi

# Build angular.io, then exit (no Angular build required)
if [[ ${CI_MODE:-} == "aio" ]]; then
  travisFoldStart "build.aio"
  (
    cd "`dirname $0`/../../aio"
    yarn build

    # If this is a PR for angular/angular@master or angular/angular@<stable-branch>, deploy a
    # snapshot for previewing early (if preconditions are met) regardless of the test outcome.
    if [[ ${TRAVIS_REPO_SLUG} == "angular/angular" ]] &&
       ([[ $TRAVIS_BRANCH == "master" ]] || [[ $TRAVIS_BRANCH == $STABLE_BRANCH ]]) &&
       [[ $TRAVIS_PULL_REQUEST != "false" ]]; then
      travisFoldStart "deploy.aio.pr-preview"
        yarn deploy-preview -- --skip-build
      travisFoldEnd "deploy.aio.pr-preview"
    fi
  )
  travisFoldEnd "build.aio"
  exit 0;
fi

# Build the Angular packages then exit (no further build required)
if [[ ${CI_MODE:-} == "aio_e2e" ]]; then
  travisFoldStart "build.aio_e2e"
  (
    ./build.sh
  )
  travisFoldEnd "build.aio_e2e"
  exit 0;
fi

travisFoldStart "tsc tools"
  $(npm bin)/tsc -p tools
  $(npm bin)/tsc -p packages/tsc-wrapped/tsconfig-build.json
  cp packages/tsc-wrapped/package.json dist/packages-dist/tsc-wrapped
  $(npm bin)/tsc -p packages/tsc-wrapped/tsconfig.json
  cp packages/tsc-wrapped/package.json dist/all/@angular/tsc-wrapped
travisFoldEnd "tsc tools"


travisFoldStart "tsc all"
  node --max-old-space-size=3000 dist/packages-dist/tsc-wrapped/src/main -p packages
  node --max-old-space-size=3000 dist/packages-dist/tsc-wrapped/src/main -p modules
travisFoldEnd "tsc all"


# TODO(i): what are these compilations here for?
travisFoldStart "tsc a bunch of useless stuff"
  node dist/packages-dist/tsc-wrapped/src/main -p packages/core/tsconfig-build.json
  node dist/packages-dist/tsc-wrapped/src/main -p packages/common/tsconfig-build.json
  node dist/packages-dist/tsc-wrapped/src/main -p packages/platform-browser/tsconfig-build.json
  node dist/packages-dist/tsc-wrapped/src/main -p packages/router/tsconfig-build.json
  node dist/packages-dist/tsc-wrapped/src/main -p packages/forms/tsconfig-build.json
travisFoldEnd "tsc a bunch of useless stuff"
