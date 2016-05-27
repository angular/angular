#!/usr/bin/env bash

set -ex -o pipefail

echo 'travis_fold:start:BUILD'

# Setup environment
cd `dirname $0`
source ./env.sh
cd ../..

$(npm bin)/tsc -p tools
cp tools/tsc-wrapped/package.json dist/tools/tsc-wrapped
node dist/tools/tsc-wrapped/src/main -p modules

echo 'travis_fold:end:BUILD'
