#!/usr/bin/env bash

set -u -e -o pipefail

(
  cd `dirname $0`
  ./build.sh

  gulp serve-examples &
  trap "kill $!" EXIT

  (
    cd ../../
    NODE_PATH=${NODE_PATH:-}:dist/all
    $(npm bin)/protractor protractor-examples-e2e.conf.js --bundles=true
  )
)
