#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# Run unit tests for our tools/ directory
travisFoldStart "test.unit.tools"
  node ./dist/tools/tsc-watch/ tools runCmdsOnly

  # TODO(i) could this be rolled into the tools tests above? why is it separate?
  travisFoldStart "test.unit.validate-commit-message"
    (
      cd tools/validate-commit-message
      $(npm bin)/jasmine
    )
  travisFoldEnd "test.unit.validate-commit-message"
travisFoldEnd "test.unit.tools"


# Run unit tests in node
travisFoldStart "test.unit.node"
  node ./dist/tools/tsc-watch/ node runCmdsOnly
travisFoldEnd "test.unit.node"


# rebuild to revert files in @angular/compiler/test
# TODO(tbosch): remove this and teach karma to serve the right files
travisFoldStart "test.unit.rebuildHack"
  node dist/tools/@angular/tsc-wrapped/src/main -p packages/tsconfig.json
  node dist/tools/@angular/tsc-wrapped/src/main -p modules/tsconfig.json
travisFoldStart "test.unit.rebuildHack"


travisFoldStart "test.unit.localChrome"
  $(npm bin)/karma start ./karma-js.conf.js --single-run --browsers=${KARMA_JS_BROWSERS}
travisFoldEnd "test.unit.localChrome"


travisFoldStart "test.unit.localChrome.router"
  $(npm bin)/karma start ./packages/router/karma.conf.js --single-run --browsers=${KARMA_JS_BROWSERS}
travisFoldEnd "test.unit.localChrome.router"
