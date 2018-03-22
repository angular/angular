#!/usr/bin/env bash

set -u -e -o pipefail
# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh
# Build angular.io, then exit (no Angular build required)
if [[ ${CI_MODE:-} == "aio" ]]; then
  travisFoldStart "build.aio"
  (
    cd "`dirname $0`/../../aio"
    yarn build

    # If this is a PR for angular/angular@master or angular/angular@<stable-branch>, deploy a
    # snapshot for previewing early (if preconditions are met) regardless of the test outcome.
    if [[ ${CIRCLE_PROJECT_USERNAME} == "angular" ]] &&
       [[ ${CIRCLE_PROJECT_REPONAME} == "angular" ]] &&
       ([[ $CIRCLE_BRANCH == "master" ]] || [[ $CIRCLE_BRANCH == $STABLE_BRANCH ]]) &&
       [ -z "$CIRCLE_PULL_REQUEST" ]; then
        yarn deploy-preview --skip-build
      travisFoldEnd "deploy.aio.pr-preview"
    fi
  )
  travisFoldEnd "build.aio"
  exit 0;
fi

# Build the Angular packages then exit (no further build required)
if [[ ${CI_MODE:-} == "aio_e2e" || ${CI_MODE:-} == "aio_tools_test" ]]; then
  travisFoldStart "build.$CI_MODE"
  (
  ./build.sh
  )
  travisFoldEnd "build.$CI_MODE"
  exit 0;
fi

travisFoldStart "tsc tools"
  $(npm bin)/tsc -p tools
  $(npm bin)/tsc -p packages/compiler/tsconfig-tools.json
  $(npm bin)/tsc -p packages/compiler-cli/tsconfig-tools.json
travisFoldEnd "tsc tools"


travisFoldStart "tsc all"
  node dist/tools/@angular/compiler-cli/src/main -p packages/tsconfig-metadata.json
  $(npm bin)/tsc -p packages
  $(npm bin)/tsc -p modules
travisFoldEnd "tsc all"
