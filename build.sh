#!/usr/bin/env bash

set -u -e -o pipefail

readonly currentDir=$(cd $(dirname $0); pwd)
source ${currentDir}/scripts/ci/_travis-fold.sh

# TODO(i): wrap into subshell, so that we don't pollute CWD, but not yet to minimize diff collision with Jason
cd ${currentDir}

PACKAGES=(core
  compiler
  common
  animations
  forms
  platform-browser
  platform-browser-dynamic
  http
  platform-server
  platform-webworker
  platform-webworker-dynamic
  upgrade
  router
  compiler-cli
  language-service
  benchpress)

BUILD_ALL=true
BUNDLE=true
VERSION_PREFIX=$(node -p "require('./package.json').version")
VERSION_SUFFIX="-$(git log --oneline -1 | awk '{print $1}')"
ROUTER_VERSION_PREFIX=$(node -p "require('./package.json').version.replace(/^2/, '3')")
REMOVE_BENCHPRESS=false
BUILD_EXAMPLES=true

for ARG in "$@"; do
  case "$ARG" in
    --packages=*)
      PACKAGES_STR=${ARG#--packages=}
      PACKAGES=( ${PACKAGES_STR//,/ } )
      BUILD_ALL=false
      ;;
    --bundle=*)
      BUNDLE=( "${ARG#--bundle=}" )
      ;;
    --publish)
      VERSION_SUFFIX=""
      REMOVE_BENCHPRESS=true
      ;;
    --examples=*)
      BUILD_EXAMPLES=${ARG#--examples=}
      ;;
    *)
      echo "Unknown option $ARG."
      exit 1
      ;;
  esac
done

getPackageContents() {
  echo "{\"typings\": \"../typings/${2}/${3:-$2}.d.ts\", \"main\": \"../bundles/${1}-${2}.umd.js\", \"module\": \"../@angular/${1}/${2}.es5.js\", \"es2015\": \"../@angular/${1}/${2}.js\"}"
}

#######################################
# Downlevel ES2015 to ESM/ES5
# Arguments:
#   param1 - Destination folder
#   param2 - Input path
#   param3 - Output path
# Returns:
#   None
#######################################
downlevelES2015() {
  echo '{"presets": [ ["es2015", { "modules": false }] ], "compact": false }' > ${1}/.babelrc
  $BABELJS ${2} -o ${3}
  rm -f ${1}/.babelrc
}

VERSION="${VERSION_PREFIX}${VERSION_SUFFIX}"
ROUTER_VERSION="${ROUTER_VERSION_PREFIX}${VERSION_SUFFIX}"
echo "====== BUILDING: Version ${VERSION} (Router ${ROUTER_VERSION})"

TSC="node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main"
UGLIFYJS=`pwd`/node_modules/.bin/uglifyjs
BABELJS=`pwd`/node_modules/.bin/babel
BABILI=`pwd`/node_modules/.bin/babili
TSCONFIG=./tools/tsconfig.json


travisFoldStart "build tools"
  echo "====== (tools)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
  rm -rf ./dist/tools/
  mkdir -p ./dist/tools/
  $(npm bin)/tsc -p ${TSCONFIG}

  cp ./tools/@angular/tsc-wrapped/package.json ./dist/tools/@angular/tsc-wrapped
travisFoldEnd "build tools"


if [[ ${BUILD_ALL} == true ]]; then
  travisFoldStart "clean dist"
    rm -rf ./dist/all/
    rm -rf ./dist/packages-dist
  travisFoldEnd "clean dist"

  travisFoldStart "copy e2e files"
    mkdir -p ./dist/all/

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
    ln -s ../../../../node_modules/base64-js .
    ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
    ln -s ../../../../node_modules/rxjs .
    ln -s ../../../../node_modules/angular/angular.js .
    ln -s ../../../../node_modules/hammerjs/hammer.js .
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
    ln -s ../../../../node_modules/reflect-metadata/Reflect.js .
    ln -s ../../../../node_modules/rxjs .
    ln -s ../../../../node_modules/angular/angular.js .
    ln -s ../../../../bower_components/polymer .
    ln -s ../../../../node_modules/incremental-dom/dist/incremental-dom-cjs.js
    cd -
  travisFoldEnd "copy e2e files"

  TSCONFIG=modules/tsconfig.json
  travisFoldStart "tsc -p ${TSCONFIG}"
    $TSC -p ${TSCONFIG}
  travisFoldEnd "tsc -p ${TSCONFIG}"
fi

for PACKAGE in ${PACKAGES[@]}
do
  travisFoldStart "build package: ${PACKAGE}"
  PWD=`pwd`
  ROOTDIR=${PWD}/modules/@angular
  SRCDIR=${PWD}/modules/@angular/${PACKAGE}
  DESTDIR=${PWD}/dist/packages-dist/${PACKAGE}
  DEST_MODULE=${DESTDIR}/@angular
  DEST_BUNDLES=${DESTDIR}/bundles

  # ESM/2015
  JS_PATH=${DEST_MODULE}/${PACKAGE}.js
  JS_PATH_ES5=${DEST_MODULE}/${PACKAGE}.es5.js
  JS_TESTING_PATH=${DEST_MODULE}/${PACKAGE}/testing.js
  JS_TESTING_PATH_ES5=${DEST_MODULE}/${PACKAGE}/testing.es5.js
  JS_STATIC_PATH=${DEST_MODULE}/${PACKAGE}/static.js
  JS_STATIC_PATH_ES5=${DEST_MODULE}/${PACKAGE}/static.es5.js
  JS_UPGRADE_PATH=${DEST_MODULE}/${PACKAGE}/upgrade.js
  JS_UPGRADE_PATH_ES5=${DEST_MODULE}/${PACKAGE}/upgrade.es5.js
  JS_ANIMATIONS_PATH=${DEST_MODULE}/${PACKAGE}/animations.js
  JS_ANIMATIONS_PATH_ES5=${DEST_MODULE}/${PACKAGE}/animations.es5.js
  JS_ANIMATIONS_TESTING_PATH=${DEST_MODULE}/${PACKAGE}/animations/testing.js
  JS_ANIMATIONS_TESTING_PATH_ES5=${DEST_MODULE}/${PACKAGE}/animations/testing.es5.js

  # UMD/ES5
  UMD_ES5_PATH=${DEST_BUNDLES}/${PACKAGE}.umd.js
  UMD_TESTING_ES5_PATH=${DEST_BUNDLES}/${PACKAGE}-testing.umd.js
  UMD_STATIC_ES5_PATH=${DEST_BUNDLES}/${PACKAGE}-static.umd.js
  UMD_UPGRADE_ES5_PATH=${DEST_BUNDLES}/${PACKAGE}-upgrade.umd.js
  UMD_ES5_MIN_PATH=${DEST_BUNDLES}/${PACKAGE}.umd.min.js
  UMD_STATIC_ES5_MIN_PATH=${DEST_BUNDLES}/${PACKAGE}-static.umd.min.js
  UMD_UPGRADE_ES5_MIN_PATH=${DEST_BUNDLES}/${PACKAGE}-upgrade.umd.min.js
  UMD_ANIMATIONS_ES5_PATH=${DEST_BUNDLES}/${PACKAGE}-animations.umd.js
  UMD_ANIMATIONS_ES5_MIN_PATH=${DEST_BUNDLES}/${PACKAGE}-animations.umd.min.js
  UMD_ANIMATIONS_TESTING_ES5_PATH=${DEST_BUNDLES}/${PACKAGE}-animations-testing.umd.js

  if [[ ${PACKAGE} != router ]]; then
    LICENSE_BANNER=${PWD}/modules/@angular/license-banner.txt
  fi
  if [[ ${PACKAGE} == router ]]; then
    LICENSE_BANNER=${PWD}/modules/@angular/router-license-banner.txt
  fi

  rm -rf ${DESTDIR}

  # When .babelrc file exists, the dist package will have ES2015 sources, ESM/ES5, and UMD bundles. Because of a bug
  # preventing the @angular/compiler package from running through this pipeline, we have to manually check for the Compiler
  # package as well. The tsconfig-build.json defaults to building to the root of the package dist dir, but when
  # outputting ES2015 then bundling from there, built files should go to the DEST_MODULE folder.
  echo "======      [${PACKAGE}]: COMPILING: ${TSC} -p ${SRCDIR}/tsconfig-build.json"
  if [[ -e ${SRCDIR}/.babelrc || ${PACKAGE} == "compiler" ]]; then
    $TSC -p ${SRCDIR}/tsconfig-build.json -outDir ${DEST_MODULE}
  else
    $TSC -p ${SRCDIR}/tsconfig-build.json
  fi

  echo "======        Move ${PACKAGE} typings"
  if [[ -e ${SRCDIR}/.babelrc || -d ${DEST_MODULE} ]]; then
    rsync -a --exclude=*.js --exclude=*.js.map ${DEST_MODULE}/ ${DESTDIR}/typings
    mv ${DESTDIR}/typings/index.d.ts ${DESTDIR}/typings/${PACKAGE}.d.ts
    mv ${DESTDIR}/typings/index.metadata.json ${DESTDIR}/typings/${PACKAGE}.metadata.json
  else
    rsync -a --exclude=*.js --exclude=*.js.map ${DESTDIR}/ ${DESTDIR}/typings
    find ${DESTDIR} -name "*.d.ts" -not -path "${DESTDIR}/typings/*" -exec rm -f {} \;
  fi

  if [[ -e ${SRCDIR}/tsconfig-es5.json ]]; then
    echo "======      [${PACKAGE}]: COMPILING (ES5): ${TSC} -p ${SRCDIR}/tsconfig-es5.json"
    $TSC -p ${SRCDIR}/tsconfig-es5.json
  fi

  cp ${SRCDIR}/package.json ${DESTDIR}/
  if [[ -e ${SRCDIR}/.babelrc ]]; then
    cp ${SRCDIR}/.babelrc ${DESTDIR}/
  fi
  cp ${PWD}/modules/@angular/README.md ${DESTDIR}/

  if [[ -e ${SRCDIR}/tsconfig-upgrade.json ]]; then
    echo "======      [${PACKAGE}]: COMPILING (UPGRADE): ${TSC} -p ${SRCDIR}/tsconfig-upgrade.json"
    $TSC -p ${SRCDIR}/tsconfig-upgrade.json
  fi

  if [[ -e ${SRCDIR}/tsconfig-testing.json ]]; then
    echo "======      [${PACKAGE}]: COMPILING (TESTING): ${TSC} -p ${SRCDIR}/tsconfig-testing.json"
    $TSC -p ${SRCDIR}/tsconfig-testing.json
  fi

  if [[ -e ${SRCDIR}/tsconfig-animations.json ]]; then
    echo "======      [${PACKAGE}]: COMPILING (ANIMATIONS): ${TSC} -p ${SRCDIR}/tsconfig-animations.json"
    $TSC -p ${SRCDIR}/tsconfig-animations.json

    if [[ -e ${SRCDIR}/tsconfig-animations-testing.json ]]; then
      echo "======      [${PACKAGE}]: COMPILING (ANIMATION TESTING): ${TSC} -p ${SRCDIR}/tsconfig-animations-testing.json"
      $TSC -p ${SRCDIR}/tsconfig-animations-testing.json
    fi
  fi

  if [[ -e ${SRCDIR}/tsconfig-static.json ]]; then
    echo "======      [${PACKAGE}]: COMPILING (STATIC): ${TSC} -p ${SRCDIR}/tsconfig-static.json"
    $TSC -p ${SRCDIR}/tsconfig-static.json
  fi

  if [[ -e ${SRCDIR}/tsconfig-esm5.json ]]; then
    echo "======      [${PACKAGE}]: COMPILING (ESM/ES5): ${TSC} -p ${SRCDIR}/tsconfig-esm5.json"
    ${TSC} -p ${SRCDIR}/tsconfig-esm5.json
  fi

  if [[ ${PACKAGE} == benchpress ]]; then
    cp ${SRCDIR}/*.md ${DESTDIR}
    cp -r ${SRCDIR}/docs ${DESTDIR}
  fi

  if [[ ${BUNDLE} == true && ${PACKAGE} != compiler-cli && ${PACKAGE} != benchpress ]]; then

    echo "======      BUNDLING: ${SRCDIR} ====="
    mkdir ${DEST_BUNDLES}

    (
      cd  ${SRCDIR}
      echo "======         Rollup ${PACKAGE} index"
      if [[ -e rollup.config.js ]]; then
        ../../../node_modules/.bin/rollup -c rollup.config.js
      else
        ../../../node_modules/.bin/rollup -i ${DEST_MODULE}/index.js -o ${JS_PATH}
        cat ${LICENSE_BANNER} > ${JS_PATH}.tmp
        cat ${JS_PATH} >> ${JS_PATH}.tmp
        mv ${JS_PATH}.tmp ${JS_PATH}
      fi

      if ! [[ ${PACKAGE} == 'benchpress' ]]; then
        rm -f ${DEST_MODULE}/index.*
        rm -rf ${DEST_MODULE}/src
      fi

      if [[ -e ${DESTDIR}/.babelrc ]]; then

        echo "======         Downleveling ES2015 to UMD/ES5"
        $BABELJS ${JS_PATH} -o ${UMD_ES5_PATH}

        ### Minification ###
        echo "======         Minifying ES2015"
        $BABILI ${JS_PATH} -o ${UMD_ES5_MIN_PATH}
        echo "======         Downleveling minified ES2015 to UMD/ES5"
        $BABELJS ${UMD_ES5_MIN_PATH} -o ${UMD_ES5_MIN_PATH}

        echo "======         Minifying UMD/ES5"
        $UGLIFYJS -c --screw-ie8 --comments -o ${UMD_ES5_MIN_PATH} ${UMD_ES5_MIN_PATH}
        ### END Minification ###
      elif [[ -e rollup-umd.config.js ]]; then
        # For packages not running through babel, use the UMD/ES5 config
        echo "======         Rollup ${PACKAGE} index to UMD/ES5"
        ../../../node_modules/.bin/rollup -c rollup-umd.config.js
        [[ -d ${DESTDIR}/es5 ]] && rm -rf ${DESTDIR}/es5
        echo "======         Minifying UMD/ES5"
        $UGLIFYJS -c --screw-ie8 --comments -o ${UMD_ES5_MIN_PATH} ${UMD_ES5_PATH}
      fi

      rm -f ${DESTDIR}/.babelrc
      if [[ -d ${DEST_MODULE} ]]; then
        echo "======         Downleveling ES2015 to ESM/ES5"
        downlevelES2015 ${DESTDIR} ${JS_PATH} ${JS_PATH_ES5}
      fi

      if [[ -d testing ]]; then
        echo "======         Rollup ${PACKAGE} testing"
        ../../../node_modules/.bin/rollup -i ${DESTDIR}/testing/index.js -o ${DESTDIR}/testing.tmp.js

        echo "======         Downleveling ${PACKAGE} TESTING to UMD/ES5"
        [[ -e ${SRCDIR}/.babelrc-testing ]] && cp ${SRCDIR}/.babelrc-testing ${DESTDIR}/.babelrc
        $BABELJS ${DESTDIR}/testing.tmp.js -o ${UMD_TESTING_ES5_PATH}
        rm -f ${DESTDIR}/.babelrc

        echo "======         Move ${PACKAGE} testing typings"
        rsync -a --exclude=*.js --exclude=*.js.map ${DESTDIR}/testing/ ${DESTDIR}/typings/testing

        rm -rf ${DESTDIR}/testing

        mkdir ${DESTDIR}/testing && [[ -d ${DEST_MODULE}/${PACKAGE} ]] || mkdir ${DEST_MODULE}/${PACKAGE}

        getPackageContents "${PACKAGE}" "testing" "index" > ${DESTDIR}/testing/package.json

        mv ${DESTDIR}/testing.tmp.js ${JS_TESTING_PATH}
        downlevelES2015 ${DESTDIR} ${JS_TESTING_PATH} ${JS_TESTING_PATH_ES5}
        cat ${LICENSE_BANNER} > ${UMD_TESTING_ES5_PATH}.tmp
        cat ${UMD_TESTING_ES5_PATH} >> ${UMD_TESTING_ES5_PATH}.tmp
        mv ${UMD_TESTING_ES5_PATH}.tmp ${UMD_TESTING_ES5_PATH}
      fi

      if [[ -e static.ts ]]; then
        echo "======         Rollup ${PACKAGE} static"
        rm -f ${DEST_MODULE}/static.*
        ../../../node_modules/.bin/rollup -i ${DESTDIR}/static/static.js -o ${DESTDIR}/static.tmp.js

        echo "======         Downleveling ${PACKAGE} STATIC to UMD/ES5"
        [[ -e ${SRCDIR}/.babelrc-static ]] && cp ${SRCDIR}/.babelrc-static ${DESTDIR}/.babelrc
        $BABELJS ${DESTDIR}/static.tmp.js -o ${UMD_STATIC_ES5_PATH}
        rm -f ${DESTDIR}/.babelrc

        echo "======         Move ${PACKAGE} static typings"
        rsync -a --exclude=*.js ${DESTDIR}/static/ ${DESTDIR}/typings/static
        rm -f ${DESTDIR}/typings/static/index.d.ts
        rm -rf ${DESTDIR}/static

        mkdir ${DESTDIR}/static && [[ -d ${DEST_MODULE}/${PACKAGE} ]] || mkdir ${DEST_MODULE}/${PACKAGE}

        getPackageContents "${PACKAGE}" "static"> ${DESTDIR}/static/package.json

        mv ${DESTDIR}/static.tmp.js ${JS_STATIC_PATH}
        downlevelES2015 ${DESTDIR} ${JS_STATIC_PATH} ${JS_STATIC_PATH_ES5}
        cat ${LICENSE_BANNER} > ${UMD_STATIC_ES5_PATH}.tmp
        cat ${UMD_STATIC_ES5_PATH} >> ${UMD_STATIC_ES5_PATH}.tmp
        mv ${UMD_STATIC_ES5_PATH}.tmp ${UMD_STATIC_ES5_PATH}
        $UGLIFYJS -c --screw-ie8 --comments -o ${UMD_STATIC_ES5_MIN_PATH} ${UMD_STATIC_ES5_PATH}
      fi

      if [[ -e upgrade.ts ]]; then
        echo "======         Rollup ${PACKAGE} upgrade"
        rm -f ${DEST_MODULE}/upgrade.*
        ../../../node_modules/.bin/rollup -i ${DESTDIR}/upgrade/upgrade.js -o ${DESTDIR}/upgrade.tmp.js

        echo "======         Downleveling ${PACKAGE} UPGRADE to UMD/ES5"
        [[ -e ${SRCDIR}/.babelrc-upgrade ]] && cp ${SRCDIR}/.babelrc-upgrade ${DESTDIR}/.babelrc
        $BABELJS ${DESTDIR}/upgrade.tmp.js -o ${UMD_UPGRADE_ES5_PATH}
        rm -f ${DESTDIR}/.babelrc

        echo "======         Move ${PACKAGE} upgrade typings"
        rsync -a --exclude=*.js ${DESTDIR}/upgrade/ ${DESTDIR}/typings/upgrade
        rm -f ${DESTDIR}/typings/upgrade/index.d.ts
        rm -rf ${DESTDIR}/upgrade

        mkdir ${DESTDIR}/upgrade && [[ -d ${DEST_MODULE}/${PACKAGE} ]] || mkdir ${DEST_MODULE}/${PACKAGE}

        getPackageContents "${PACKAGE}" "upgrade" > ${DESTDIR}/upgrade/package.json

        mv ${DESTDIR}/upgrade.tmp.js ${JS_UPGRADE_PATH}
        downlevelES2015 ${DESTDIR} ${JS_UPGRADE_PATH} ${JS_UPGRADE_PATH_ES5}
        cat ${LICENSE_BANNER} > ${UMD_UPGRADE_ES5_PATH}.tmp
        cat ${UMD_UPGRADE_ES5_PATH} >> ${UMD_UPGRADE_ES5_PATH}.tmp
        mv ${UMD_UPGRADE_ES5_PATH}.tmp ${UMD_UPGRADE_ES5_PATH}
        $UGLIFYJS -c --screw-ie8 --comments -o ${UMD_UPGRADE_ES5_MIN_PATH} ${UMD_UPGRADE_ES5_PATH}
      fi

      if [[ -d animations ]]; then
        echo "======         Rollup ${PACKAGE} animations"
        ../../../node_modules/.bin/rollup -i ${DESTDIR}/animations/index.js -o ${DESTDIR}/animations.tmp.js

        echo "======         Downleveling ${PACKAGE} ANIMATIONS to ES5/UMD"
        [[ -e ${SRCDIR}/.babelrc-animations ]] && cp ${SRCDIR}/.babelrc-animations ${DESTDIR}/.babelrc
        $BABELJS ${DESTDIR}/animations.tmp.js -o ${UMD_ANIMATIONS_ES5_PATH}
        rm -f ${DESTDIR}/.babelrc

        echo "======         Move ${PACKAGE} animations typings"
        rsync -a --exclude=*.js --exclude=*.js.map ${DESTDIR}/animations/ ${DESTDIR}/typings/animations
        mv ${DESTDIR}/typings/animations/index.d.ts ${DESTDIR}/typings/animations/animations.d.ts
        mv ${DESTDIR}/typings/animations/index.metadata.json ${DESTDIR}/typings/animations/animations.metadata.json

        echo "======         Rollup ${PACKAGE} animations/testing"
        ../../../node_modules/.bin/rollup -i ${DESTDIR}/animations/testing/index.js -o ${DESTDIR}/animations-testing.tmp.js

        echo "======         Downleveling ${PACKAGE} ANIMATIONS TESTING to ES5/UMD"
        [[ -e ${SRCDIR}/.babelrc-animations-testing ]] && cp ${SRCDIR}/.babelrc-animations-testing ${DESTDIR}/.babelrc
        $BABELJS ${DESTDIR}/animations-testing.tmp.js -o ${UMD_ANIMATIONS_TESTING_ES5_PATH}
        rm -f ${DESTDIR}/.babelrc

        echo "======         Move ${PACKAGE} animations testing typings"
        rsync -a --exclude=*.js --exclude=*.js.map ${DESTDIR}/animations/testing/ ${DESTDIR}/typings/animations/testing

        rm -rf ${DESTDIR}/animations

        mkdir ${DESTDIR}/animations && [[ -d ${DEST_MODULE}/${PACKAGE} ]] || mkdir ${DEST_MODULE}/${PACKAGE}
        mkdir ${DESTDIR}/animations/testing

        getPackageContents "${PACKAGE}" "animations" > ${DESTDIR}/animations/package.json

        echo '{"typings": "../../typings/animations/testing/index.d.ts", "main": "../../bundles/platform-browser-animations-testing.umd.js", "module": "../../@angular/platform-browser/animations/testing.es5.js", "es2015": "../../@angular/platform-browser/animations/testing.js"}' > ${DESTDIR}/animations/testing/package.json
        # This is needed for Compiler to be able to find the bundle index.
        echo '{"typings": "animations.d.ts"}' > ${DESTDIR}/typings/animations/package.json

        mv ${DESTDIR}/animations.tmp.js ${JS_ANIMATIONS_PATH}
        downlevelES2015 ${DESTDIR} ${JS_ANIMATIONS_PATH} ${JS_ANIMATIONS_PATH_ES5}
        cat ${LICENSE_BANNER} > ${UMD_ANIMATIONS_ES5_PATH}.tmp
        cat ${UMD_ANIMATIONS_ES5_PATH} >> ${UMD_ANIMATIONS_ES5_PATH}.tmp
        mv ${UMD_ANIMATIONS_ES5_PATH}.tmp ${UMD_ANIMATIONS_ES5_PATH}
        $UGLIFYJS -c --screw-ie8 --comments -o ${UMD_ANIMATIONS_ES5_MIN_PATH} ${UMD_ANIMATIONS_ES5_PATH}

        mkdir ${DEST_MODULE}/${PACKAGE}/animations

        mv ${DESTDIR}/animations-testing.tmp.js ${JS_ANIMATIONS_TESTING_PATH}
        downlevelES2015 ${DESTDIR} ${JS_ANIMATIONS_TESTING_PATH} ${JS_ANIMATIONS_TESTING_PATH_ES5}
        cat ${LICENSE_BANNER} > ${UMD_ANIMATIONS_TESTING_ES5_PATH}.tmp
        cat ${UMD_ANIMATIONS_TESTING_ES5_PATH} >> ${UMD_ANIMATIONS_TESTING_ES5_PATH}.tmp
        mv ${UMD_ANIMATIONS_TESTING_ES5_PATH}.tmp ${UMD_ANIMATIONS_TESTING_ES5_PATH}
      fi

      for FILE in ${DEST_MODULE}/public_api*; do
        rm -f ${FILE}
      done

    ) 2>&1 | grep -v "as external dependency"

  fi

  (
    echo "======      VERSION: Updating version references"
    cd ${DESTDIR}
    echo "======       EXECUTE: perl -p -i -e \"s/0\.0\.0\-PLACEHOLDER/${VERSION}/g\" $""(grep -ril 0\.0\.0\-PLACEHOLDER .)"
    perl -p -i -e "s/0\.0\.0\-PLACEHOLDER/${VERSION}/g" $(grep -ril 0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
    echo "======       EXECUTE: perl -p -i -e \"s/0\.0\.0\-ROUTERPLACEHOLDER/${ROUTER_VERSION}/g\" $""(grep -ril 0\.0\.0\-ROUTERPLACEHOLDER .)"
    perl -p -i -e "s/0\.0\.0\-ROUTERPLACEHOLDER/${ROUTER_VERSION}/g" $(grep -ril 0\.0\.0\-ROUTERPLACEHOLDER .) < /dev/null 2> /dev/null
  )

  travisFoldEnd "build package: ${PACKAGE}"
done

if [[ ${BUILD_EXAMPLES} == true ]]; then
  travisFoldStart "build examples"
    echo "====== Building examples: ./modules/@angular/examples/build.sh ====="
    ./modules/@angular/examples/build.sh
  travisFoldEnd "build examples"
fi

if [[ ${REMOVE_BENCHPRESS} == true ]]; then
  travisFoldStart "remove benchpress"
    echo ""
    echo "==== Removing benchpress from publication"
    rm -r dist/packages-dist/benchpress
  travisFoldEnd "remove benchpress"
fi


# Print return arrows as a log separator
travisFoldReturnArrows
