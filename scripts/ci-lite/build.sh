#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:BUILD'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

$(npm bin)/tsc -p ./tools/tsconfig.json

# TODO: Right now we have a cycle in that the compiler_cli depends on Angular
# but we need it to compile Angular.
# The solution right now is to do 2 compilation runs.
# Fix this by separating the metadata extraction into a separate binary that does
# not depend on Angular.
$(npm bin)/tsc -p ./modules/tsconfig.json
node dist/all/@angular/compiler_cli/src/main -p modules/tsconfig.json

# Compile the compiler_cli integration tests
node dist/all/@angular/compiler_cli/src/main -p modules/@angular/compiler_cli/integrationtest

echo 'travis_fold:end:BUILD'
