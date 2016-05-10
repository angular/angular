#!/usr/bin/env bash

set -e -o pipefail

cd $(dirname $0)
cd $(pwd)/../../..
export NODE_PATH=$NODE_PATH:$(pwd)/dist/all:$(pwd)/dist/tools
readonly TESTDIR="modules/@angular/compiler_cli/integrationtest"
rm $TESTDIR/src/*.{ngfactory,css.shim}.ts
node dist/all/@angular/compiler_cli/src/main -p $TESTDIR
node dist/tools/cjs-jasmine -- $TESTDIR/**/*_spec.js
