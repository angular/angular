#!/usr/bin/env bash

cd `dirname $0`

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-server
do
  SRCDIR=./modules/angular2/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}
  echo "====== COMPILING: ${SRCDIR}/tsconfig.json ====="
  rm -rf ${DESTDIR}
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig.json
  cp ${SRCDIR}/package.json ${DESTDIR}/

  echo "====== COMPILING: ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json
done

TSCONFIG=./modules/angular2/tsconfig.json
echo "====== COMPILING: ${TSCONFIG} ====="
rm -rf ./dist/packages-all/
$(npm bin)/tsc -p ${TSCONFIG}
