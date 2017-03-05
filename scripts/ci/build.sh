#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


travisFoldStart "tsc tools"
  $(npm bin)/tsc -p tools
  cp tools/@angular/tsc-wrapped/package.json dist/tools/@angular/tsc-wrapped
travisFoldEnd "tsc tools"


travisFoldStart "tsc all"
  node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main -p modules
travisFoldEnd "tsc all"


# TODO(i): what are these compilations here for?
travisFoldStart "tsc a bunch of useless stuff"
  node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/core/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/common/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/platform-browser/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/router/tsconfig-build.json
  node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/forms/tsconfig-build.json
travisFoldEnd "tsc a bunch of useless stuff"


# Build integration tests
if [[ ${CI_MODE} == "e2e" ]]; then
  travisFoldStart "build.integration"
    cd "`dirname $0`/../../integration"
    ./build_rxjs_es6.sh
    cd -
  travisFoldEnd "build.integration"
fi


# Build angular.io
if [[ ${CI_MODE} == "aio" ]]; then
  travisFoldStart "build.aio"
    cd "`dirname $0`/../../aio"
    yarn run build
    cd -
  travisFoldEnd "build.aio"
fi
