#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


travisFoldStart "test.docs"
  (
    cd ${PROJECT_ROOT}/aio
    $(npm bin)/gulp docs-test
  )
travisFoldEnd "test.docs"
