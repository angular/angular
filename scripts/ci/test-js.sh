#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh

# Run unit tests in node
travisFoldStart "test.unit.node"
  node --harmony ./dist/tools/tsc-watch/ node runCmdsOnly
travisFoldEnd "test.unit.node"


# rebuild to revert files in @angular/compiler/test
# TODO(tbosch): remove this and teach karma to serve the right files
travisFoldStart "test.unit.rebuildHack"
  node dist/tools/@angular/compiler-cli/src/main -p packages/tsconfig-metadata.json
travisFoldStart "test.unit.rebuildHack"


travisFoldStart "test.unit.localChrome"
  $(npm bin)/karma start ./karma-js.conf.js --single-run --browsers=${KARMA_JS_BROWSERS}
travisFoldEnd "test.unit.localChrome"
