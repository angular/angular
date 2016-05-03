#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`


TSCONFIG=./modules/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/ng2tc -p ${TSCONFIG} ====="
rm -rf ./dist/all/
mkdir ./dist/all/

# prepare all files for e2e tests
cp -r ./modules/playground ./dist/all/
cp -r ./modules/playground/favicon.ico ./dist/
#rsync -aP ./modules/playground/* ./dist/all/playground/
mkdir ./dist/all/playground/vendor
cd ./dist/all/playground/vendor
ln -s ../../../../node_modules/es6-shim/es6-shim.js .
ln -s ../../../../node_modules/zone.js/dist/zone.js .
ln -s ../../../../node_modules/zone.js/dist/long-stack-trace-zone.js .
ln -s ../../../../node_modules/systemjs/dist/system.src.js .
ln -s ../../../../node_modules/base64-js/lib/b64.js .
ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
ln -s ../../../../node_modules/rxjs/bundles/Rx.js .
ln -s ../../../../node_modules/angular/angular.js .
cd -

# compile ts code
$(npm bin)/ng2tc -p ${TSCONFIG}


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
  router-deprecated \
  upgrade
do
  SRCDIR=./modules/@angular/${PACKAGE}
  DESTDIR=./dist/packages-dist/${PACKAGE}
  UMDES6PATH=${DESTDIR}/esm/${PACKAGE}.umd.js
  UMDES5PATH=${DESTDIR}/${PACKAGE}.umd.js


  echo "======      COMPILING: \$(npm bin)/ng2tc -p ${SRCDIR}/tsconfig-es5.json        ====="
  $(npm bin)/ng2tc -p ${SRCDIR}/tsconfig-es5.json
  cp ${SRCDIR}/package.json ${DESTDIR}/


  echo "======      TSC 1.8 d.ts compat for ${DESTDIR}   ====="
  # safely strips 'readonly' specifier from d.ts files to make them compatible with tsc 1.8
  if [[ ${TRAVIS} ]]; then
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i    -e 's/\(^ *(static |private )*\)*readonly  */\1/g'
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i    -E 's/^( +)abstract ([[:alnum:]]+\:)/\1\2/g'
  else
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i '' -e 's/\(^ *(static |private )*\)*readonly  */\1/g'
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i '' -E 's/^( +)abstract ([[:alnum:]]+\:)/\1\2/g'
  fi


  echo "====== (esm)COMPILING: \$(npm bin)/ng2tc -p ${SRCDIR}/tsconfig-es2015.json ====="
  $(npm bin)/ng2tc -p ${SRCDIR}/tsconfig-es2015.json


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

  cat ./modules/@angular/license-banner.txt > ${UMDES5PATH}.tmp
  cat ${UMDES5PATH} >> ${UMDES5PATH}.tmp
  mv ${UMDES5PATH}.tmp ${UMDES5PATH}

done
