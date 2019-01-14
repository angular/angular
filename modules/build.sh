#!/usr/bin/env bash

set -x -u -e -o pipefail

# Go to project directory.
cd $(dirname ${0})/..

# Build the "modules" JS output. The module e2e tests can be served by running "gulp serve".
yarn tsc -p ./modules

# Commands that have been extracted from the deleted "build.sh". These are responsible for
# copying assets and vendor files for the playground e2e tests to the dist output.
(
  echo "=> Copying asset and vendor files which are needed for playground e2e tests."
  mkdir -p ./dist/all/playground/vendor
  cp -r ./modules/playground ./dist/all/
  cp -r ./modules/playground/favicon.ico ./dist/
  cd ./dist/all/playground/vendor
  ln -s ../../../../node_modules/core-js/client/core.js .
  ln -s ../../../../node_modules/zone.js/dist/zone.js .
  ln -s ../../../../node_modules/zone.js/dist/long-stack-trace-zone.js .
  ln -s ../../../../node_modules/systemjs/dist/system.src.js .
  ln -s ../../../../node_modules/base64-js .
  ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
  ln -s ../../../../node_modules/rxjs .
  ln -s ../../../../node_modules/angular/angular.js .
  ln -s ../../../../node_modules/hammerjs/hammer.js .
)

# Commands that have been extracted from the deleted "build.sh". These are responsible for
# copying assets and vendor files for the benchmarks e2e tests to the dist output.
(
  echo "=> Copying asset and vendor files which are needed for e2e benchmarks."
  mkdir -p ./dist/all/benchmarks/vendor
  cp -r ./modules/benchmarks ./dist/all/
  cp -r ./modules/benchmarks/favicon.ico ./dist/
  cd ./dist/all/benchmarks/vendor
  ln -s ../../../../node_modules/core-js/client/core.js .
  ln -s ../../../../node_modules/zone.js/dist/zone.js .
  ln -s ../../../../node_modules/zone.js/dist/long-stack-trace-zone.js .
  ln -s ../../../../node_modules/systemjs/dist/system.src.js .
  ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
  ln -s ../../../../node_modules/rxjs .
  ln -s ../../../../node_modules/angular/angular.js .
  ln -s ../../../../node_modules/incremental-dom/dist/incremental-dom-cjs.js
)
