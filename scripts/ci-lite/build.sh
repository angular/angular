#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:BUILD'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

$(npm bin)/tsc -p ./tools/tsconfig.json
$(npm bin)/ng2tc -p ./modules/tsconfig.json
$(npm bin)/tsc -p ./tools/compiler_cli/src/tsconfig.json

echo 'travis_fold:end:BUILD'
