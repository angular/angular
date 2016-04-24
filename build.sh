#!/usr/bin/env bash

cd `dirname $0`

rm -rf ./dist/packages-dist

for PACKAGE in \
  core \
  compiler \
  common \
  platform-browser \
  platform-server \
  http \
  router \
  upgrade \
  testing
do
  SRCDIR=./modules/angular2/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}

  echo "======      COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig.json        ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig.json
  cp ${SRCDIR}/package.json ${DESTDIR}/

  echo "====== (esm)COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json
done

TSCONFIG=./modules/angular2/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
rm -rf ./dist/packages-all/
$(npm bin)/tsc -p ${TSCONFIG}
