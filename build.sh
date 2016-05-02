#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`


TSCONFIG=./modules/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
rm -rf ./dist/all/
$(npm bin)/tsc -p ${TSCONFIG}


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
  upgrade
do
  SRCDIR=./modules/@angular/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}
  UMDES6PATH=${DESTDIR}/esm/${PACKAGE}.umd.js
  UMDES5PATH=${DESTDIR}/${PACKAGE}.umd.js


  echo "======      COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig.json        ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig.json
  cp ${SRCDIR}/package.json ${DESTDIR}/


  echo "======      TSC 1.8 d.ts compat for ${DESTDIR}   ====="
  # safely strips 'readonly' specifier from d.ts files to make them compatible with tsc 1.8
  if [[ ${TRAVIS} ]]; then
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i    -e 's/\(^ *(static |private )*\)*readonly  */\1/g'
  else
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i '' -e 's/\(^ *(static |private )*\)*readonly  */\1/g'
  fi


  echo "====== (esm)COMPILING: \$(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/tsc -p ${SRCDIR}/tsconfig-es2015.json


  echo "======      BUNDLING: ${SRCDIR} ====="
  (
    cd  ${SRCDIR}
    echo "..."  # here just to have grep match something and not exit with 1
    ../../../node_modules/.bin/rollup -c rollup.config.js
  ) 2>&1 | grep -v "as external dependency"

  # workaround for https://github.com/rollup/rollup/issues/626
  if [[ ${TRAVIS} ]]; then
    sed -i    "s/ class exports\./ class /g" ${DESTDIR}/esm/${PACKAGE}.umd.js
  else
    sed -i '' "s/ class exports\./ class /g" ${DESTDIR}/esm/${PACKAGE}.umd.js
  fi

  $(npm bin)/tsc  \
      --out ${UMDES5PATH} \
      --target es5 \
      --allowJs \
      ${UMDES6PATH} \
      modules/\@angular/manual_typings/globals.d.ts \
      modules/\@angular/typings/es6-collections/es6-collections.d.ts \
      modules/\@angular/typings/es6-promise/es6-promise.d.ts
  rm ${UMDES6PATH}

done
