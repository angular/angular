#!/bin/bash

# Script that bundles the dev-app using the Google Closure compiler.
# This is script is used to verify closure-compatibility of all Material components.

set -e -o pipefail

# Go to the project root directory
cd $(dirname $0)/../..

# Build a release of material, material-moment-adapter, and cdk packages.
$(npm bin)/gulp material:build-release:clean
$(npm bin)/gulp cdk:build-release
$(npm bin)/gulp material-moment-adapter:build-release

# Build demo-app with ES2015 modules. Closure compiler is then able to parse imports.
$(npm bin)/gulp :build:devapp:assets :build:devapp:scss
$(npm bin)/tsc -p src/demo-app/tsconfig-build.json --target ES2015 --module ES2015

# Create a list of all RxJS source files.
rxjsSourceFiles=$(find node_modules/rxjs/ -name '*.js');

# List of entry points in the CDK package. Exclude "testing" since it's not an entry point.
cdkEntryPoints=($(find src/cdk -maxdepth 1 -mindepth 1 -type d -not -name testing -exec basename {} \;))

OPTS=(
  "--language_in=ES6_STRICT"
  "--language_out=ES5"
  "--compilation_level=ADVANCED_OPTIMIZATIONS"
  "--js_output_file=dist/closure/closure-bundle.js"
  "--variable_renaming_report=dist/closure/variable_renaming_report"
  "--property_renaming_report=dist/closure/property_renaming_report"
  "--warning_level=QUIET"
  "--rewrite_polyfills=false"
  "--module_resolution=node"
  "--process_common_js_modules"

  # List of path prefixes to be removed from ES6 & CommonJS modules.
  "--js_module_root=dist/packages"
  "--js_module_root=dist/releases/material"
  "--js_module_root=dist/releases/cdk"
  "--js_module_root=dist/releases/material-moment-adapter"
  "--js_module_root=node_modules/@angular/core"
  "--js_module_root=node_modules/@angular/common"
  "--js_module_root=node_modules/@angular/common/http"
  "--js_module_root=node_modules/@angular/compiler"
  "--js_module_root=node_modules/@angular/forms"
  "--js_module_root=node_modules/@angular/router"
  "--js_module_root=node_modules/@angular/platform-browser"
  "--js_module_root=node_modules/@angular/platform-browser/animations"
  "--js_module_root=node_modules/@angular/platform-browser-dynamic"
  "--js_module_root=node_modules/@angular/animations"
  "--js_module_root=node_modules/@angular/animations/browser"
  "--js_module_root=node_modules/moment"

  # Flags to simplify debugging.
  "--formatting=PRETTY_PRINT"
  "--debug"

  # Include the Material and CDK FESM bundles
  dist/releases/material/esm2015/material.js
  dist/releases/cdk/esm2015/cdk.js
  dist/releases/material-moment-adapter/esm2015/material-moment-adapter.js

  # Include all Angular FESM bundles.
  node_modules/@angular/core/esm5/index.js
  node_modules/@angular/common/esm5/index.js
  node_modules/@angular/common/esm5/http.js
  node_modules/@angular/compiler/esm5/index.js
  node_modules/@angular/forms/esm5/index.js
  node_modules/@angular/http/esm5/index.js
  node_modules/@angular/router/esm5/index.js
  node_modules/@angular/platform-browser/esm5/index.js
  node_modules/@angular/platform-browser/esm5/animations/index.js
  node_modules/@angular/platform-browser-dynamic/esm5/index.js
  node_modules/@angular/animations/esm5/index.js
  node_modules/@angular/animations/esm5/browser/index.js

  # Include other dependencies like Zone.js, Moment.js, and RxJS
  node_modules/zone.js/dist/zone.js
  node_modules/moment/moment.js
  $rxjsSourceFiles

  # Include all files from the demo-app package.
  $(find dist/packages/demo-app -name '*.js')

  "--entry_point=./dist/packages/demo-app/main.js"
  "--dependency_mode=STRICT"
)

# Walk through every entry-point of the CDK and add it to closure options.
for i in "${cdkEntryPoints[@]}"; do
  OPTS+=("--js_module_root=dist/releases/cdk/${i}")
  OPTS+=("dist/releases/cdk/esm2015/${i}.js")
done

# Write closure flags to a closure flagfile.
closureFlags=$(mktemp)
echo ${OPTS[*]} > $closureFlags

# Run the Google Closure compiler java runnable.
java -jar node_modules/google-closure-compiler/compiler.jar --flagfile $closureFlags

echo "Finished bundling the dev-app using Google Closure Compiler."
