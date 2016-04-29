#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:BUILD'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

$(npm bin)/tsc -p ./tools/tsconfig.json
$(npm bin)/tsc -p ./modules/tsconfig.json



echo 'travis_fold:end:BUILD'
