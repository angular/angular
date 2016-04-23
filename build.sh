#!/bin/bash

cd `dirname $0`

for package in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-server
do
  TSCONFIG=./modules/angular2/${package}/tsconfig.json
  echo "====== COMPILING: ${TSCONFIG} ====="
  rm -rf ./dist/packages-dist/${package}
  $(npm bin)/tsc -p ${TSCONFIG}
  TSCONFIG=./modules/angular2/${package}/tsconfig-es2015.json
  echo "====== COMPILING: ${TSCONFIG} ====="
  $(npm bin)/tsc -p ${TSCONFIG}
done

TSCONFIG=./modules/angular2/tsconfig.json
echo "====== COMPILING: ${TSCONFIG} ====="
rm -rf ./dist/packages-all/
$(npm bin)/tsc -p ${TSCONFIG}
