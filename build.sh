#!/usr/bin/env bash

cd `dirname $0`

rm -rf ./dist/packages-dist

for PACKAGE in \
  facade \
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
  SRCDIR=./modules/@angular/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}

  echo "======      COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig.json        ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig.json
  cp ${SRCDIR}/package.json ${DESTDIR}/

  echo "====== (esm)COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json
done

TSCONFIG=./modules/@angular/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
rm -rf ./dist/packages-all/
$(npm bin)/tsc -p ${TSCONFIG}
