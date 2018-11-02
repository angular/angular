#!/usr/bin/env bash

set -u -e -o pipefail

readonly currentDir=$(cd $(dirname $0); pwd)
source ${currentDir}/scripts/ci/_travis-fold.sh

# TODO(i): wrap into subshell, so that we don't pollute CWD, but not yet to minimize diff collision with Jason
cd ${currentDir}

PACKAGES=(compiler
  core
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
  benchpress
  service-worker
  elements)

TSC_PACKAGES=(compiler
  compiler-cli
  language-service
  benchpress)

NODE_PACKAGES=(compiler-cli
  benchpress)

SCOPED_PACKAGES=$(
  for P in ${PACKAGES[@]}; do echo \\@angular/${P}; done
)
NG_UPDATE_PACKAGE_GROUP=$(
  # The first sed creates an array of strings
  # The second sed is to allow it to be run in the perl expression so forward slashes don't end
  #   the regular expression.
  echo \[\"${SCOPED_PACKAGES[@]}\"] \
    | sed 's/ /", "/g' \
    | sed 's/\//\\\//g'
)


BUILD_ALL=true
BUNDLE=true
VERSION_PREFIX=$(node -p "require('./package.json').version")
VERSION_SUFFIX="-$(git log --oneline -1 | awk '{print $1}')"
REMOVE_BENCHPRESS=false
BUILD_EXAMPLES=true
COMPILE_SOURCE=true
TYPECHECK_ALL=true
BUILD_TOOLS=true
export NODE_PATH=${NODE_PATH:-}:${currentDir}/dist/tools

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
  if [[ -f "${1}" || "${name}" == "src" || "${name}" == "test" || "${name}" == "integrationtest" || "${name}" == "locales" ]]; then
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
# Rollup index files recursively, ignoring blacklisted directories
# Arguments:
#   param1 - Base source folder
#   param2 - Destination directory
#   param3 - Package name
#   param4 - Is sub directory
# Returns:
#   None
#######################################
rollupIndex() {
  # Iterate over the files in this directory, rolling up each into ${2} directory
  in_file="${1}/${3}.js"
  if [ ${4:-} ]; then
    out_file="$(dropLast ${2})/${3}.js"
  else
    out_file="${2}/${3}.js"
  fi

  BANNER_TEXT=`cat ${LICENSE_BANNER}`
  if [[ -f ${in_file} ]]; then
    echo "===========           $ROLLUP -i ${in_file} -o ${out_file} --sourcemap -f es --banner BANNER_TEXT >/dev/null 2>&1"
    $ROLLUP -i ${in_file} -o ${out_file} --sourcemap -f es --banner "$BANNER_TEXT" >/dev/null 2>&1
  fi

  # Recurse for sub directories
  for DIR in ${1}/* ; do
    local sub_package=$(basename "${DIR}")
    isIgnoredDirectory ${DIR} && continue
    local regex=".+/(.+)/${sub_package}.js"
    if [[ "${DIR}/${sub_package}.js" =~ $regex ]]; then

      rollupIndex ${DIR} ${2}/${BASH_REMATCH[1]} ${sub_package} true
    fi
  done
}

#######################################
# Recursively runs rollup on any entry point that has a "rollup.config.js" file
# Arguments:
#   param1 - Base source folder containing rollup.config.js
# Returns:
#   None
#######################################
runRollup() {
  if [[ -f "${1}/rollup.config.js" ]]; then
    cd ${1}

    echo "======           $ROLLUP -c ${1}/rollup.config.js --sourcemap"
    $ROLLUP -c rollup.config.js --sourcemap >/dev/null 2>&1

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
      echo "======          $UGLIFY -c --comments -o ${out_file} --source-map "includeSources=true,content='${file}.map',filename='${out_file}.map'" ${file}"
      $UGLIFY -c --comments -o ${out_file} --source-map "includeSources=true,content='${file}.map',filename='${out_file}.map'" ${file}
    fi
  done
}

#######################################
# Recursively compile package
# Arguments:
#   param1 - Source directory
#   param2 - Out dir
#   param3 - Package Name
# Returns:
#   None
#######################################
compilePackage() {
  # For TSC_PACKAGES items
  if containsElement "${3}" "${TSC_PACKAGES[@]}"; then
    echo "======      [${3}]: COMPILING: ${TSC} -p ${1}/tsconfig-build.json"
    local package_name=$(basename "${2}")
    $TSC -p ${1}/tsconfig-build.json
    if [[ "${3}" = "compiler" ]]; then
      if [[ "${package_name}" = "testing" ]]; then
        echo "$(cat ${LICENSE_BANNER}) ${N} export * from './${package_name}/${package_name}'" > ${2}/../${package_name}.d.ts
      fi
    fi
  else
    echo "======      [${3}]: COMPILING: ${NGC} -p ${1}/tsconfig-build.json"
    local package_name=$(basename "${2}")
    $NGC -p ${1}/tsconfig-build.json
    if [[ "${package_name}" != "locales" ]]; then
      echo "======           Create ${1}/../${package_name}.d.ts re-export file for tsickle"
      echo "$(cat ${LICENSE_BANNER}) ${N} export * from './${package_name}/${package_name}'" > ${2}/../${package_name}.d.ts
      echo "{\"__symbolic\":\"module\",\"version\":3,\"metadata\":{},\"exports\":[{\"from\":\"./${package_name}/${package_name}\"}],\"flatModuleIndexRedirect\":true}" > ${2}/../${package_name}.metadata.json
    fi
  fi

  # Build subpackages
  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    BASE_DIR=$(basename "${DIR}")
    # Skip over directories that are not nested entry points
    [[ -e ${DIR}/tsconfig-build.json && "${BASE_DIR}" != "integrationtest" ]] || continue
    compilePackage ${DIR} ${2}/${BASE_DIR} ${3}
  done
}

#######################################
# Recursively compile package
# Arguments:
#   param1 - Source directory
#   param2 - Out dir
#   param3 - Package Name
# Returns:
#   None
#######################################
compilePackageES5() {
  if containsElement "${3}" "${TSC_PACKAGES[@]}"; then
    echo "======      [${3}]: COMPILING: ${TSC} -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap"
    local package_name=$(basename "${2}")
    $TSC -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap
  else
    echo "======      [${3}]: COMPILING: ${NGC} -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap"
    local package_name=$(basename "${2}")
    $NGC -p ${1}/tsconfig-build.json --target es5 -d false --outDir ${2} --importHelpers true --sourceMap
  fi

  for DIR in ${1}/* ; do
    [ -d "${DIR}" ] || continue
    BASE_DIR=$(basename "${DIR}")
    # Skip over directories that are not nested entry points
    [[ -e ${DIR}/tsconfig-build.json && "${BASE_DIR}" != "integrationtest" ]] || continue
    compilePackageES5 ${DIR} ${2} ${3}
  done
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
    # Confirm there is an ${PACKAGE}.d.ts and ${PACKAGE}.metadata.json file. If so, create
    # the package.json and recurse.
    if [[ -f ${DIR}/${PACKAGE}.d.ts && -f ${DIR}/${PACKAGE}.metadata.json ]]; then
      echo '{"typings": "${PACKAGE}.d.ts"}' > ${DIR}/package.json
      addNgcPackageJson ${DIR}
    fi
  done
}

updateVersionReferences() {
  NPM_DIR="$1"
  (
    echo "======      VERSION: Updating version references in ${NPM_DIR}"
    cd ${NPM_DIR}
    echo "======       EXECUTE: perl -p -i -e \"s/0\.0\.0\-PLACEHOLDER/${VERSION}/g\" $""(grep -ril 0\.0\.0\-PLACEHOLDER .)"
    perl -p -i -e "s/0\.0\.0\-PLACEHOLDER/${VERSION}/g" $(grep -ril 0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
  )
}

#######################################
# Drops the last entry of a path. Similar to normalizing a path such as
# /parent/child/.. to /parent.
# Arguments:
#   param1 - Directory on which to drop the last item
# Returns:
#   None
#######################################

dropLast() {
  local last_item=$(basename ${1})
  local regex=local regex="(.+)/${last_item}"
  if [[ "${1}" =~ $regex ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "${1}"
  fi
}

VERSION="${VERSION_PREFIX}${VERSION_SUFFIX}"
echo "====== BUILDING: Version ${VERSION}"

N="
"
TSC=`pwd`/node_modules/.bin/tsc
NGC="node --max-old-space-size=3000 `pwd`/dist/tools/@angular/compiler-cli/src/main"
UGLIFY=`pwd`/node_modules/.bin/uglifyjs
TSCONFIG=./tools/tsconfig.json
ROLLUP=`pwd`/node_modules/.bin/rollup

if [[ ${BUILD_TOOLS} == true ]]; then
  travisFoldStart "build tools" "no-xtrace"
    echo "====== (tools)COMPILING: \$(npm bin)/tsc -p ${TSCONFIG} ====="
    rm -rf ./dist/tools/
    mkdir -p ./dist/tools/
    $(npm bin)/tsc -p ${TSCONFIG}
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
    $TSC -p ${TSCONFIG}
  travisFoldEnd "tsc -p ${TSCONFIG}"
  TSCONFIG="packages/examples/tsconfig.json"
  travisFoldStart "tsc -p ${TSCONFIG}" "no-xtrace"
    $TSC -p ${TSCONFIG}
  travisFoldEnd "tsc -p ${TSCONFIG}"
  TSCONFIG="modules/tsconfig.json"
  travisFoldStart "tsc -p ${TSCONFIG}" "no-xtrace"
    $TSC -p ${TSCONFIG}
  travisFoldEnd "tsc -p ${TSCONFIG}"

fi

if [[ ${BUILD_ALL} == true ]]; then
  rm -rf ./dist/packages
  if [[ ${BUNDLE} == true ]]; then
    rm -rf ./dist/packages-dist
  fi
fi

if [[ ${BUILD_TOOLS} == true || ${BUILD_ALL} == true ]]; then
  echo "====== (compiler)COMPILING: \$(npm bin)/tsc -p packages/compiler/tsconfig-tools.json"
  $(npm bin)/tsc -p packages/compiler/tsconfig-tools.json
  echo "====== (compiler)COMPILING: \$(npm bin)/tsc -p packages/compiler-cli/tsconfig-tools.json"
  $(npm bin)/tsc -p packages/compiler-cli/tsconfig-tools.json

  mkdir -p ./dist/packages-dist
  rsync -a packages/bazel/ ./dist/packages-dist/bazel
  echo "workspace(name=\"angular\")" > ./dist/packages-dist/bazel/WORKSPACE
  # Remove BEGIN-INTERNAL...END-INTERAL blocks
  # https://stackoverflow.com/questions/24175271/how-can-i-match-multi-line-patterns-in-the-command-line-with-perl-style-regex
  perl -0777 -n -i -e "s/(?m)^.*BEGIN-INTERNAL[\w\W]*END-INTERNAL.*\n//g; print" $(grep -ril BEGIN-INTERNAL dist/packages-dist/bazel) < /dev/null 2> /dev/null
  # Re-host //packages/bazel/ which is just // in the public distro
  perl -0777 -n -i -e "s#//packages/bazel/#//#g; print" $(grep -ril packages/bazel dist/packages-dist/bazel) < /dev/null 2> /dev/null
  perl -0777 -n -i -e "s#angular/packages/bazel/#angular/#g; print" $(grep -ril packages/bazel dist/packages-dist/bazel) < /dev/null 2> /dev/null
  updateVersionReferences dist/packages-dist/bazel
fi

for PACKAGE in ${PACKAGES[@]}
do
  travisFoldStart "build package: ${PACKAGE}" "no-xtrace"
  PWD=`pwd`
  ROOT_DIR=${PWD}/packages
  SRC_DIR=${ROOT_DIR}/${PACKAGE}
  ROOT_OUT_DIR=${PWD}/dist/packages
  OUT_DIR=${ROOT_OUT_DIR}/${PACKAGE}
  OUT_DIR_ESM5=${ROOT_OUT_DIR}/${PACKAGE}/esm5
  NPM_DIR=${PWD}/dist/packages-dist/${PACKAGE}
  ESM2015_DIR=${NPM_DIR}/esm2015
  FESM2015_DIR=${NPM_DIR}/fesm2015
  ESM5_DIR=${NPM_DIR}/esm5
  FESM5_DIR=${NPM_DIR}/fesm5
  BUNDLES_DIR=${NPM_DIR}/bundles

  LICENSE_BANNER=${ROOT_DIR}/license-banner.txt

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

      (
        cd  ${SRC_DIR}
        echo "======         Copy ESM2015 for ${PACKAGE}"
        rsync -a --exclude="locale/**" --exclude="**/*.d.ts" --exclude="**/*.metadata.json" ${OUT_DIR}/ ${ESM2015_DIR}

        echo "======         Rollup ${PACKAGE}"
        rollupIndex ${OUT_DIR} ${FESM2015_DIR} ${PACKAGE}

        echo "======         Produce ESM5 version"
        compilePackageES5 ${SRC_DIR} ${OUT_DIR_ESM5} ${PACKAGE}
        rsync -a --exclude="locale/**" --exclude="**/*.d.ts" --exclude="**/*.metadata.json" ${OUT_DIR_ESM5}/ ${ESM5_DIR}
        rollupIndex ${OUT_DIR_ESM5} ${FESM5_DIR} ${PACKAGE}

        echo "======         Run rollup conversions on ${PACKAGE}"
        runRollup ${SRC_DIR}
        addBanners ${BUNDLES_DIR}
        minify ${BUNDLES_DIR}

        if [[ -e ${SRC_DIR}/build.sh ]]; then
          echo "======         Custom build for ${PACKAGE}"
          cd ${SRC_DIR} && ${SRC_DIR}/build.sh
        fi

      ) 2>&1 | grep -v "as external dependency"

      if [[ ${PACKAGE} == "common" ]]; then
        echo "======      Copy i18n locale data"
        rsync -a ${OUT_DIR}/locales/ ${NPM_DIR}/locales
      fi
    else
      echo "======        Copy ${PACKAGE} node tool"
      rsync -a ${OUT_DIR}/ ${NPM_DIR}
    fi

    echo "======        Copy ${PACKAGE} package.json and .externs.js files"
    rsync -am --include="package.json" --include="*/" --exclude=* ${SRC_DIR}/ ${NPM_DIR}/
    rsync -am --include="*.externs.js" --include="*/" --exclude=* ${SRC_DIR}/ ${NPM_DIR}/

    # Replace the NG_UPDATE_PACKAGE_GROUP value with the JSON array of packages.
    perl -p -i -e "s/\"NG_UPDATE_PACKAGE_GROUP\"/${NG_UPDATE_PACKAGE_GROUP}/g" ${NPM_DIR}/package.json < /dev/null

    cp ${ROOT_DIR}/README.md ${NPM_DIR}/
  fi


  if [[ -d ${NPM_DIR} ]]; then
    updateVersionReferences ${NPM_DIR}
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
