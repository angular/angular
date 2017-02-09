#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:BUILD'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

$(npm bin)/tsc -v
$(npm bin)/tsc -p tools
cp tools/@angular/tsc-wrapped/package.json dist/tools/@angular/tsc-wrapped
node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main -p modules
node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/core/tsconfig-build.json
node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/common/tsconfig-build.json
node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/platform-browser/tsconfig-build.json
node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/router/tsconfig-build.json
node dist/tools/@angular/tsc-wrapped/src/main -p modules/@angular/forms/tsconfig-build.json

if [[ ${CI_MODE} == "e2e" ]]; then
  echo 'travis_fold:start:BUILD.integration'

  # Build integration
  cd "`dirname $0`/../../integration"
  ./build_rxjs_es6.sh
  cd -

  echo 'travis_fold:end:BUILD.integration'
fi

if [[ ${CI_MODE} == "aio" ]]; then
  echo 'travis_fold:start:BUILD.aio'

  # Build angular.io
  cd "`dirname $0`/../../angular.io"
  yarn run build
  cd -

  echo 'travis_fold:end:BUILD.aio'
fi

echo 'travis_fold:end:BUILD'
