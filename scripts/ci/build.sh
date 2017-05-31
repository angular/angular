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


travisFoldStart "tsc tools"
  $(npm bin)/tsc -p tools
  cp tools/@angular/tsc-wrapped/package.json dist/tools/@angular/tsc-wrapped
travisFoldEnd "tsc tools"


travisFoldStart "tsc all"
  node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main -p packages
  node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main -p modules
travisFoldEnd "tsc all"


# TODO(i): what are these compilations here for?
travisFoldStart "tsc a bunch of useless stuff"
  node dist/tools/@angular/tsc-wrapped/src/main -p packages/core/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p packages/common/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p packages/platform-browser/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p packages/router/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p packages/forms/tsconfig-build.json
travisFoldEnd "tsc a bunch of useless stuff"


# Build angular.io
if [[ ${CI_MODE:-} == "aio" ]]; then
  travisFoldStart "build.aio"
  (
    cd "`dirname $0`/../../aio"
    yarn build

    # If this is a PR for angular/angular@master, deploy a snapshot for previewing early
    # (if preconditions are met) regardless of the test outcome.
    if [[ ${TRAVIS_REPO_SLUG} == "angular/angular" ]] &&
       [[ ${TRAVIS_BRANCH} == "master" ]] &&
       [[ $TRAVIS_PULL_REQUEST != "false" ]]; then
      travisFoldStart "deploy.aio.pr-preview"
        yarn deploy-preview -- --skip-build
      travisFoldEnd "deploy.aio.pr-preview"
    fi
  )
  travisFoldEnd "build.aio"
fi
