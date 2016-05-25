#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:BUILD'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

$(npm bin)/tsc -p ./tools/tsconfig.json

node dist/tools/tsc-wrapped/src/main -p modules/tsconfig.json

# Compile the compiler_cli integration tests
node dist/all/@angular/compiler_cli/src/main -p modules/@angular/compiler_cli/integrationtest

echo 'travis_fold:end:BUILD'
