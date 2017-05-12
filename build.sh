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
  platform-browser
  platform-browser-dynamic
  forms
  http
  platform-server
  platform-webworker
  platform-webworker-dynamic
  upgrade
  router
  compiler-cli
  language-service
  benchpress)

NODE_PACKAGES=(compiler-cli
  benchpress)

BUILD_ALL=true
BUNDLE=true
VERSION_PREFIX=$(node -p "require('./package.json').version")
VERSION_SUFFIX="-$(git log --oneline -1 | awk '{print $1}')"
ROUTER_VERSION_PREFIX=$(node -p "require('./package.json').version.replace(/^2/, '3')")
REMOVE_BENCHPRESS=false
BUILD_EXAMPLES=true
COMPILE_SOURCE=true
TYPECHECK_ALL=true
BUILD_TOOLS=true

for ARG in "$@"; do
  case "$ARG" in
    --quick-bundle=*)
      COMPILE_SOURCE=false
      TYPECHECK_ALL=false
      BUILD_EXAMPLES=false
      BUILD_TOOLS=false
      ;;
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
    --compile=*)
      COMPILE_SOURCE=${ARG#--compile=}
      ;;
    --typecheck=*)
      TYPECHECK_ALL=${ARG#--typecheck=}
      ;;
    --tools=*)
      BUILD_TOOLS=${ARG#--tools=}
      ;;
    *)
      echo "Unknown option $ARG."
      exit 1
      ;;
  esac
done

#######################################
# Verifies a directory isn't in the ignored list
# Arguments:
#   param1 - Path to check
# Returns:
#   Boolean
#######################################
isIgnoredDirectory() {
  name=$(basename ${1})
  if [[ -f "${1}" || "${name}" == "src" || "${name}" == "test" || "${name}" == "integrationtest" ]]; then
    return 0
  else
    return 1
  fi
}

#######################################
# Check if array contains an element
# Arguments:
#   param1 - Element to check
#   param2 - Array to look for element in
# Returns:
#   None
#######################################
containsElement () {
  local e
  for e in "${@:2}"; do [[ "$e" == "$1" ]] && return 0; done
  return 1
}

#######################################
# Downlevel ES2015 to ESM/ES5
# Arguments:
#   param1 - Source folder
#   param2 - Naming suffix to apply. Must end in ".ts" (defaults to .es5.ts)
# Returns:
#   None
#######################################
downlevelES2015() {
  # Iterate over the files in this directory, converting to .es5.ts
  regex="(.+).js"
  for file in ${1}/*.js ; do
    if [[ ${file} =~ $regex ]]; then
      ts_file="${BASH_REMATCH[1]}${2:-".es5.ts"}"
      cp ${file} ${ts_file}

      echo "======           $TSC ${ts_file} --target es5 --module es2015 --noLib"
      ($TSC ${ts_file} --target es5 --module es2015 --noLib --sourceMap) > /dev/null 2>&1 || true
      mapSources "${BASH_REMATCH[1]}${2:-".es5.js"}"
      rm -f ${ts_file}
    fi
  done

  # Recurse for sub directories
  for DIR in ${1}/* ; do
    isIgnoredDirectory ${DIR} && continue
    downlevelES2015 ${DIR}
  done
}

#######################################
# Rollup index files recursively, ignoring blacklisted directories
# Arguments:
#   param1 - Base source folder
#   param2 - Destination directory
#   param3 - Config file
# Returns:
#   None
#######################################
rollupIndex() {
  # Iterate over the files in this directory, rolling up each into ${2} directory
  local regex=".+/(.+)/index.js"
  if [[ "${1}/index.js" =~ $regex ]]; then
    in_file="${1}/index.js"
    out_file="${2}/${BASH_REMATCH[1]}.js"

    echo "======           $ROLLUP -i ${in_file} -o ${out_file}"

    if [[ -f "${3}" ]]; then
      $ROLLUP -i ${in_file} -o ${out_file} -c ${3} --sourcemap
    else
      $ROLLUP -i ${in_file} -o ${out_file} --sourcemap
    fi
    cat ${LICENSE_BANNER} > ${out_file}.tmp
    cat ${out_file} >> ${out_file}.tmp
    mv ${out_file}.tmp ${out_file}

    mapSources "${out_file}"

    # Recurse for sub directories
    for DIR in ${1}/* ; do
      isIgnoredDirectory ${DIR} && continue
      # NOTE: We need to re-run this regex and use the new match as Bash doesn't have closures
      if [[ "${1}/index.js" =~ $regex ]]; then
        rollupIndex ${DIR} ${2}/${BASH_REMATCH[1]} "$(dirname $3)/${BASH_REMATCH[1]}/rollup.config.js"
      fi
    done
  fi
}


#######################################
# Recursively runs rollup on any entry point that has a "rollup.config.js" file
# Arguments:
#   param1 - Base source folder containing rollup.config.js
# Returns:
#   None
#######################################
runRollup() {
  local regex="dest: ['\"](.+)['\"],*"
  if [[ -f "${1}/rollup.config.js" ]]; then
    cd ${1}

    echo "======           $ROLLUP -c ${1}/rollup.config.js"
    $ROLLUP -c rollup.config.js --sourcemap

    local dest_line=$(cat "${1}/rollup.config.js" | grep 'dest:')
    if [[ ${dest_line} =~ $regex ]]; then
      mapSources "${BASH_REMATCH[1]}"
    fi

    # Recurse for sub directories
    for DIR in ${1}/* ; do
      isIgnoredDirectory ${DIR} && continue
      runRollup ${DIR}
    done
  fi
}

#######################################
# Adds banners to all files in a directory
# Arguments:
#   param1 - Directory to add license banners to
# Returns:
#   None
#######################################
addBanners() {
  for file in ${1}/*; do
    if [[ -f ${file} && "${file##*.}" != "map" ]]; then
      cat ${LICENSE_BANNER} > ${file}.tmp
      cat ${file} >> ${file}.tmp
      mv ${file}.tmp ${file}
    fi
  done
}

#######################################
# Minifies files in a directory
# Arguments:
#   param1 - Directory to minify
# Returns:
#   None
#######################################
minify() {
  # Iterate over the files in this directory, rolling up each into ${2} directory
  regex="(.+).js"
  files=(${1}/*)
  echo "${files[@]}"
  for file in "${files[@]}"; do
    echo "${file}"
    base_file=$( basename "${file}" )
    if [[ "${base_file}" =~ $regex && "${base_file##*.}" != "map" ]]; then
      local out_file=$(dirname "${file}")/${BASH_REMATCH[1]}.min.js
      $UGLIFYJS -c --screw-ie8 --comments -o ${out_file} --source-map ${out_file}.map --source-map-include-sources ${file}
      mapSources "${out_file}"
    fi
  done
}

#######################################
# Recursively compile package
# Arguments:
#   param1 - Source directory
#   param2 - Out dir
#   param3 - Package Name
#   param4 - Is child (are we recursing?)
# Returns:
#   None
#######################################
compilePackage() {
  echo "======      [${3}]: COMPILING: ${NGC} -p ${1}/tsconfig-build.json"
  # For NODE_PACKAGES items (not getting rolled up)
  if containsElement "${PACKAGE}" "${NODE_PACKAGES[@]}"; then
    $TSC -p ${1}/tsconfig-build.json
  else
    local package_name=$(basename "${2}")
    $NGC -p ${1}/tsconfig-build.json
    echo "======           Create ${1}/../${package_name}.d.ts re-export file for Closure"
    echo "$(cat ${LICENSE_BANNER}) ${N} export * from './${package_name}/index'" > ${2}/../${package_name}.d.ts
    echo "{\"__symbolic\":\"module\",\"version\":3,\"metadata\":{},\"exports\":[{\"from\":\"./${package_name}/index\"}]}" > ${2}/../${package_name}.metadata.json
  fi

  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    BASE_DIR=$(basename "${DIR}")
    # Skip over directories that are not nested entry points
    [[ -e ${DIR}/tsconfig-build.json && "${BASE_DIR}" != "integrationtest" ]] || continue
    compilePackage ${DIR} ${2}/${BASE_DIR} ${3} true
  done
}

#######################################
# Moves typings and metadata files appropriately
# Arguments:
#   param1 - Source of typings & metadata files
#   param2 - Root of destination directory
#   param3 - Package name (needed to correspond to name of d.ts and metadata.json files)
# Returns:
#   None
#######################################
moveTypings() {
  if [[ -f ${1}/index.d.ts && -f ${1}/index.metadata.json ]]; then
    mv ${1}/index.d.ts ${1}/${2}.d.ts
    mv ${1}/index.metadata.json ${1}/${2}.metadata.json
  fi
}

#######################################
# Adds a package.json in directories where needed (secondary entry point typings).
# This is read by NGC to be able to find the flat module index.
# Arguments:
#   param1 - Source directory of typings files
# Returns:
#   None
#######################################
addNgcPackageJson() {
  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    # Confirm there is an index.d.ts and index.metadata.json file. If so, create
    # the package.json and recurse.
    if [[ -f ${DIR}/index.d.ts && -f ${DIR}/index.metadata.json ]]; then
      echo '{"typings": "index.d.ts"}' > ${DIR}/package.json
      addNgcPackageJson ${DIR}
    fi
  done
}

#######################################
# This is read by NGC to be able to find the flat module index.
# Arguments:
#   param1 - JavaScript file on which to re-map sources
# Returns:
#   None
#######################################
mapSources() {
  if [[ -f "${1}.map" ]]; then
    $MAP_SOURCES -f "${1}"
  fi
}

VERSION="${VERSION_PREFIX}${VERSION_SUFFIX}"
ROUTER_VERSION="${ROUTER_VERSION_PREFIX}${VERSION_SUFFIX}"
echo "====== BUILDING: Version ${VERSION} (Router ${ROUTER_VERSION})"

N="
"
TSC=`pwd`/node_modules/.bin/tsc
NGC="node --max-old-space-size=3000 dist/tools/@angular/tsc-wrapped/src/main"
MAP_SOURCES="node `pwd`/scripts/build/map_sources.js "
UGLIFYJS=`pwd`/node_modules/.bin/uglifyjs
TSCONFIG=./tools/tsconfig.json
ROLLUP=`pwd`/node_modules/.bin/rollup

if [[ ${BUILD_TOOLS} == true ]]; then
  travisFoldStart "build tools" "no-xtrace"
    echo "====== (tools)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
    rm -rf ./dist/tools/
    mkdir -p ./dist/tools/
    $(npm bin)/tsc -p ${TSCONFIG}

    cp ./tools/@angular/tsc-wrapped/package.json ./dist/tools/@angular/tsc-wrapped
  travisFoldEnd "build tools"
fi


if [[ ${BUILD_ALL} == true && ${TYPECHECK_ALL} == true ]]; then
  travisFoldStart "clean dist" "no-xtrace"
    rm -rf ./dist/all/
    rm -rf ./dist/packages
  travisFoldEnd "clean dist"

  travisFoldStart "copy e2e files" "no-xtrace"
    mkdir -p ./dist/all/

    (
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
    )

    (
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
    )
  travisFoldEnd "copy e2e files"

  TSCONFIG="packages/tsconfig.json"
  travisFoldStart "tsc -p ${TSCONFIG}" "no-xtrace"
    $NGC -p ${TSCONFIG}
  travisFoldEnd "tsc -p ${TSCONFIG}"
  TSCONFIG="modules/tsconfig.json"
  travisFoldStart "tsc -p ${TSCONFIG}" "no-xtrace"
    $NGC -p ${TSCONFIG}
  travisFoldEnd "tsc -p ${TSCONFIG}"

fi

if [[ ${BUILD_ALL} == true ]]; then
  rm -rf ./dist/packages
  if [[ ${BUNDLE} == true ]]; then
    rm -rf ./dist/packages-dist
  fi
fi

for PACKAGE in ${PACKAGES[@]}
do
  travisFoldStart "build package: ${PACKAGE}" "no-xtrace"
  PWD=`pwd`
  ROOT_DIR=${PWD}/packages
  SRC_DIR=${ROOT_DIR}/${PACKAGE}
  ROOT_OUT_DIR=${PWD}/dist/packages
  OUT_DIR=${ROOT_OUT_DIR}/${PACKAGE}
  NPM_DIR=${PWD}/dist/packages-dist/${PACKAGE}
  MODULES_DIR=${NPM_DIR}/@angular
  BUNDLES_DIR=${NPM_DIR}/bundles

  if [[ ${PACKAGE} != router ]]; then
    LICENSE_BANNER=${ROOT_DIR}/license-banner.txt
  fi
  if [[ ${PACKAGE} == router ]]; then
    LICENSE_BANNER=${ROOT_DIR}/router-license-banner.txt
  fi

  if [[ ${COMPILE_SOURCE} == true ]]; then
    rm -rf ${OUT_DIR}
    rm -f ${ROOT_OUT_DIR}/${PACKAGE}.js
    compilePackage ${SRC_DIR} ${OUT_DIR} ${PACKAGE}
  fi

  if [[ ${BUNDLE} == true ]]; then
    echo "======      BUNDLING ${PACKAGE}: ${SRC_DIR} ====="
    rm -rf ${NPM_DIR} && mkdir -p ${NPM_DIR}

    if ! containsElement "${PACKAGE}" "${NODE_PACKAGES[@]}"; then

      echo "======        Copy ${PACKAGE} typings"
      rsync -a --exclude=*.js --exclude=*.js.map ${OUT_DIR}/ ${NPM_DIR}
#      echo "$(cat ${LICENSE_BANNER}) ${N} export * from './index'" > ${NPM_DIR}/${PACKAGE}.d.ts
#      echo "{\"alias\": \"./index.metadata.json\"}" > ${NPM_DIR}/${PACKAGE}.metadata.json
#      exit 0
      moveTypings ${NPM_DIR} ${PACKAGE}
#      addNgcPackageJson ${NPM_DIR}/typings

      (
        cd  ${SRC_DIR}
        echo "======         Rollup ${PACKAGE}"
        rollupIndex ${OUT_DIR} ${MODULES_DIR} ${ROOT_DIR}

        echo "======         Downleveling ES2015 to ESM/ES5"
        downlevelES2015 ${MODULES_DIR}

        echo "======         Run rollup conversions on ${PACKAGE}"
        runRollup ${SRC_DIR}
        addBanners ${BUNDLES_DIR}
        minify ${BUNDLES_DIR}

      ) 2>&1 | grep -v "as external dependency"
    else
      echo "======        Copy ${PACKAGE} node tool"
      rsync -a ${OUT_DIR}/ ${NPM_DIR}
    fi

    echo "======        Copy ${PACKAGE} package.json and .externs.js files"
    rsync -am --include="package.json" --include="*/" --exclude=* ${SRC_DIR}/ ${NPM_DIR}/
    rsync -am --include="*.externs.js" --include="*/" --exclude=* ${SRC_DIR}/ ${NPM_DIR}/

    cp ${ROOT_DIR}/README.md ${NPM_DIR}/
  fi


  if [[ -d ${NPM_DIR} ]]; then
    (
      echo "======      VERSION: Updating version references"
      cd ${NPM_DIR}
      echo "======       EXECUTE: perl -p -i -e \"s/0\.0\.0\-PLACEHOLDER/${VERSION}/g\" $""(grep -ril 0\.0\.0\-PLACEHOLDER .)"
      perl -p -i -e "s/0\.0\.0\-PLACEHOLDER/${VERSION}/g" $(grep -ril 0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
      echo "======       EXECUTE: perl -p -i -e \"s/0\.0\.0\-ROUTERPLACEHOLDER/${ROUTER_VERSION}/g\" $""(grep -ril 0\.0\.0\-ROUTERPLACEHOLDER .)"
      perl -p -i -e "s/0\.0\.0\-ROUTERPLACEHOLDER/${ROUTER_VERSION}/g" $(grep -ril 0\.0\.0\-ROUTERPLACEHOLDER .) < /dev/null 2> /dev/null
    )
  fi

  travisFoldEnd "build package: ${PACKAGE}"
done

if [[ ${BUILD_EXAMPLES} == true ]]; then
  travisFoldStart "build examples" "no-xtrace"
    echo "====== Building examples: ./packages/examples/build.sh ====="
    ./packages/examples/build.sh
  travisFoldEnd "build examples"
fi

if [[ ${REMOVE_BENCHPRESS} == true ]]; then
  travisFoldStart "remove benchpress" "no-xtrace"
    echo ""
    echo "==== Removing benchpress from publication"
    rm -r dist/packages-dist/benchpress
  travisFoldEnd "remove benchpress"
fi


# Print return arrows as a log separator
travisFoldReturnArrows
