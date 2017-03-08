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
  if [ -z ${NODE_PATH+x} ]; then
    export NODE_PATH=$(pwd)/dist/all:$(pwd)/dist/tools
  else
    export NODE_PATH=$NODE_PATH:$(pwd)/dist/all/:$(pwd)/dist/tools/
  fi
  echo "Compiling tools..."
  $(npm bin)/tsc -p tools
  if [[ $1 == 'node' ]]; then
    # Note: .metadata.json files are needed for the language service tests!
    echo "Creating .metadata.json files..."
    node dist/tools/@angular/tsc-wrapped/src/main -p packages
    node dist/tools/@angular/tsc-wrapped/src/main -p modules
  fi
  node dist/tools/tsc-watch/ $1 watch
fi
