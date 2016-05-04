#!/usr/bin/env bash

set -e -o pipefail

cd $(dirname $0)
cd $(pwd)/../../..
export NODE_PATH=$NODE_PATH:$(pwd)/dist/all:$(pwd)/dist/tools
node dist/all/@angular/compiler_cli/src/main -p modules/@angular/compiler_cli/integrationtest
node dist/tools/cjs-jasmine -- @angular/compiler_cli/integrationtest/**/*_spec.js
