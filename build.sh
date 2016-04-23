#!/usr/bin/env bash

cd `dirname $0`

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-server \
  router \
  mock
do
  SRCDIR=./modules/angular2/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}

  echo "======      COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig.json        ====="
  rm -rf ${DESTDIR}
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig.json
  cp ${SRCDIR}/package.json ${DESTDIR}/

  echo "====== COMPILING(esm): \$(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json
done

TSCONFIG=./modules/angular2/tsconfig.json
echo "====== COMPILING(all): \$(npm bin)/tsc -p ${TSCONFIG} ====="
rm -rf ./dist/packages-all/
$(npm bin)/tsc -p ${TSCONFIG}
