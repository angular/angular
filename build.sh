#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

rm -rf ./dist/packages-dist

for PACKAGE in \
  core \
  compiler \
  common \
  platform-browser \
  platform-browser-dynamic \
  platform-server \
  http \
  router \
  upgrade \
  testing
do
  SRCDIR=./modules/@angular/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}
  UMDES6PATH=${DESTDIR}/esm/${PACKAGE}.umd.js
  UMDES5PATH=${DESTDIR}/${PACKAGE}.umd.js


  echo "======      COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig.json        ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig.json
  cp ${SRCDIR}/package.json ${DESTDIR}/

  echo "====== (esm)COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json

  if (false); then
    echo "======      BUNDLING: ${SRCDIR} ====="
    (
      cd  ${SRCDIR}
      echo "..."  # here just to have grep match something and not exit with 1
      ../../../node_modules/.bin/rollup -c rollup.config.js
    ) 2>&1 | grep -v "as external dependency"

    # workaround for https://github.com/rollup/rollup/issues/626
    sed -i '' "s/ class exports\./ class /g" ${DESTDIR}/esm/${PACKAGE}.umd.js

    $(npm bin)/tsc  \
        --out ${UMDES5PATH} \
        --target es5 \
        --allowJs \
        ${UMDES6PATH} \
        modules/\@angular/manual_typings/globals.d.ts \
        modules/\@angular/typings/es6-collections/es6-collections.d.ts \
        modules/\@angular/typings/es6-promise/es6-promise.d.ts
    rm ${UMDES6PATH}
  fi
done

TSCONFIG=./modules/@angular/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
rm -rf ./dist/packages-all/
$(npm bin)/tsc -p ${TSCONFIG}
