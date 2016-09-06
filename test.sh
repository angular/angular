#!/usr/bin/env bash

set -e -o pipefail

if [ $# -eq 0 ]
  then
    echo "Angular test runner. (No platform specified)"
    echo
    echo "./test.sh [node|browser|browserNoRouter|router|tools]"
    echo
else
  cd `dirname $0`
  rm -rf dist/tools
  rm -rf dist/all
  if [ -z ${NODE_PATH+x} ]; then
    export NODE_PATH=$(pwd)/dist/all:$(pwd)/dist/tools
  else
    export NODE_PATH=$NODE_PATH:$(pwd)/dist/all/:$(pwd)/dist/tools/
  fi
  $(npm bin)/tsc -p tools
  node dist/tools/tsc-watch/ $1 watch
fi


