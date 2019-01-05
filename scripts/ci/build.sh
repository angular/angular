#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


travisFoldStart "tsc all"
  $(npm bin)/tsc -p packages
  $(npm bin)/tsc -p packages/examples
  $(npm bin)/tsc -p modules
travisFoldEnd "tsc all"
