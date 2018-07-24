#!/usr/bin/env bash

set -e -o pipefail

if [ $# -eq 0 ]
  then
    echo "Angular test runner. (No platform specified)"
    echo
    echo "./test.sh [node|browser|browserNoRouter|router] [--debug]"
    echo "(--debug flag only relevant to 'node' testing - see https://github.com/angular/angular/blob/master/docs/DEBUG.md)"
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
    echo "Building compiler..."
    $(npm bin)/tsc -p packages/compiler/tsconfig-tools.json
    $(npm bin)/tsc -p packages/compiler-cli/tsconfig-tools.json
    echo "Creating packages .metadata.json files..."
    node --max-old-space-size=3000 dist/tools/@angular/compiler-cli/src/main -p packages/tsconfig-metadata.json
  fi
  node --harmony dist/tools/tsc-watch/ $1 watch $2
fi
