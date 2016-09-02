#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

export NODE_PATH=${NODE_PATH}:$(pwd)/dist/all:$(pwd)/dist/tools


rm -rf ./dist/all/
mkdir -p ./dist/all/

TSCONFIG=./tools/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
$(npm bin)/tsc -p ${TSCONFIG}
cp ./tools/@angular/tsc-wrapped/package.json ./dist/tools/@angular/tsc-wrapped

echo "====== Copying files needed for e2e tests ====="
cp -r ./modules/playground ./dist/all/
cp -r ./modules/playground/favicon.ico ./dist/
#rsync -aP ./modules/playground/* ./dist/all/playground/
mkdir ./dist/all/playground/vendor
cd ./dist/all/playground/vendor
ln -s ../../../../node_modules/core-js/client/core.js .
ln -s ../../../../node_modules/zone.js/dist/zone.js .
ln -s ../../../../node_modules/zone.js/dist/long-stack-trace-zone.js .
ln -s ../../../../node_modules/systemjs/dist/system.src.js .
ln -s ../../../../node_modules/base64-js/lib/b64.js .
ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
ln -s ../../../../node_modules/rxjs .
ln -s ../../../../node_modules/angular/angular.js .
cd -

echo "====== Copying files needed for benchmarks ====="
cp -r ./modules/benchmarks ./dist/all/
cp -r ./modules/benchmarks/favicon.ico ./dist/
mkdir ./dist/all/benchmarks/vendor
cd ./dist/all/benchmarks/vendor
ln -s ../../../../node_modules/core-js/client/core.js .
ln -s ../../../../node_modules/zone.js/dist/zone.js .
ln -s ../../../../node_modules/zone.js/dist/long-stack-trace-zone.js .
ln -s ../../../../node_modules/systemjs/dist/system.src.js .
ln -s ../../../../node_modules/base64-js/lib/b64.js .
ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
ln -s ../../../../node_modules/rxjs .
ln -s ../../../../node_modules/angular/angular.js .
ln -s ../../../../bower_components/polymer .
ln -s ../../../../node_modules/incremental-dom/dist/incremental-dom-cjs.js
cd -

TSCONFIG=./modules/tsconfig.json
echo "====== (all)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
# compile ts code
TSC="node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main"
UGLIFYJS=`pwd`/node_modules/.bin/uglifyjs
$TSC -p modules/tsconfig.json

rm -rf ./dist/packages-dist

for PACKAGE in \
  core \
  compiler \
  common \
  forms \
  platform-browser \
  platform-browser-dynamic \
  platform-server \
  platform-webworker \
  platform-webworker-dynamic \
  http \
  router \
  upgrade \
  compiler-cli \
  benchpress
do
  PWD=`pwd`
  SRCDIR=${PWD}/modules/@angular/${PACKAGE}
  DESTDIR=${PWD}/dist/packages-dist/${PACKAGE}
  UMD_ES5_PATH=${DESTDIR}/bundles/${PACKAGE}.umd.js
  UMD_TESTING_ES5_PATH=${DESTDIR}/bundles/${PACKAGE}-testing.umd.js
  UMD_ES5_MIN_PATH=${DESTDIR}/bundles/${PACKAGE}.umd.min.js
  LICENSE_BANNER=${PWD}/modules/@angular/license-banner.txt

  echo "======      COMPILING: ${TSC} -p ${SRCDIR}/tsconfig.json        ====="
  $TSC -p ${SRCDIR}/tsconfig.json

  cp ${SRCDIR}/package.json ${DESTDIR}/

  if [[ -e ${SRCDIR}/tsconfig-testing.json ]]; then
    echo "======      COMPILING TESTING: ${TSC} -p ${SRCDIR}/tsconfig-testing.json"
    $TSC -p ${SRCDIR}/tsconfig-testing.json
  fi

  echo "======      TSC 1.8 d.ts compat for ${DESTDIR}   ====="
  # safely strips 'readonly' specifier from d.ts files to make them compatible with tsc 1.8
  if [ "$(uname)" == "Darwin" ]; then
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i '' -e 's/\(^ *(static |private )*\)*readonly  */\1/g'
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i '' -e 's/\/\/\/ <reference types="node" \/>//g'
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i '' -E 's/^( +)abstract ([[:alnum:]]+\:)/\1\2/g'
  else
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i -e 's/\(^ *(static |private )*\)*readonly  */\1/g'
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i -e 's/\/\/\/ <reference types="node" \/>//g'
    find ${DESTDIR} -type f -name '*.d.ts' -print0 | xargs -0 sed -i -E 's/^( +)abstract ([[:alnum:]]+\:)/\1\2/g'
  fi

  if [[ ${PACKAGE} != compiler-cli && ${PACKAGE} != benchpress ]]; then

    echo "======      BUNDLING: ${SRCDIR} ====="
    mkdir ${DESTDIR}/bundles

    (
      cd  ${SRCDIR}
      echo "======         Rollup ${PACKAGE} index"
      ../../../node_modules/.bin/rollup -c rollup.config.js
      cat ${LICENSE_BANNER} > ${UMD_ES5_PATH}.tmp
      cat ${UMD_ES5_PATH} >> ${UMD_ES5_PATH}.tmp
      mv ${UMD_ES5_PATH}.tmp ${UMD_ES5_PATH}
      $UGLIFYJS -c --screw-ie8 --comments -o ${UMD_ES5_MIN_PATH} ${UMD_ES5_PATH}


      if [[ -e rollup-testing.config.js ]]; then
        echo "======         Rollup ${PACKAGE} testing"
        ../../../node_modules/.bin/rollup -c rollup-testing.config.js
        echo "{\"main\": \"../bundles/${PACKAGE}-testing.umd.js\"}" > ${DESTDIR}/testing/package.json
        cat ${LICENSE_BANNER} > ${UMD_TESTING_ES5_PATH}.tmp
        cat ${UMD_TESTING_ES5_PATH} >> ${UMD_TESTING_ES5_PATH}.tmp
        mv ${UMD_TESTING_ES5_PATH}.tmp ${UMD_TESTING_ES5_PATH}
      fi
    ) 2>&1 | grep -v "as external dependency"

  fi
done

./modules/@angular/examples/build.sh
