#!/bin/bash

# Script that bundles the dev-app using the Google Closure compiler.
# This is script is used to verify closure-compatibility of all Material components.

set -e -o pipefail

# Go to the project root directory
cd $(dirname $0)/../..


# Build a release of material and of the CDK package.
$(npm bin)/gulp material:build-release:clean
$(npm bin)/gulp cdk:build-release

# Build demo-app with ES2015 modules. Closure compiler is then able to parse imports.
$(npm bin)/gulp :build:devapp:assets :build:devapp:scss
$(npm bin)/tsc -p src/demo-app/tsconfig-build.json --target ES2015 --module ES2015

# Re-compile RxJS sources into ES2015. Otherwise closure compiler can't parse it properly.
$(npm bin)/ngc -p scripts/closure-compiler/tsconfig-rxjs.json

# Create a list of all RxJS source files.
rxjsSourceFiles=$(find dist/packages/rxjs -name '*.js');

# Due a Closure Compiler issue https://github.com/google/closure-compiler/issues/2247
# we need to add exports to the different RxJS ES2015 files.
for i in $rxjsSourceFiles; do
    echo "export var __CLOSURE_WORKAROUND__" >> $i
done

OPTS=(
  "--language_in=ES6_STRICT"
  "--language_out=ES5"
  "--compilation_level=ADVANCED_OPTIMIZATIONS"
  "--js_output_file=dist/closure/closure-bundle.js"
  "--variable_renaming_report=dist/closure/variable_renaming_report"
  "--property_renaming_report=dist/closure/property_renaming_report"
  "--warning_level=QUIET"
  "--rewrite_polyfills=false"

  # List of path prefixes to be removed from ES6 & CommonJS modules.
  "--js_module_root=dist/packages"
  "--js_module_root=dist/releases/material"
  "--js_module_root=dist/releases/cdk"
  "--js_module_root=node_modules/@angular/core"
  "--js_module_root=node_modules/@angular/common"
  "--js_module_root=node_modules/@angular/compiler"
  "--js_module_root=node_modules/@angular/forms"
  "--js_module_root=node_modules/@angular/http"
  "--js_module_root=node_modules/@angular/router"
  "--js_module_root=node_modules/@angular/platform-browser"
  "--js_module_root=node_modules/@angular/platform-browser/animations"
  "--js_module_root=node_modules/@angular/platform-browser-dynamic"
  "--js_module_root=node_modules/@angular/animations"
  "--js_module_root=node_modules/@angular/animations/browser"

  # Flags to simplify debugging.
  "--formatting=PRETTY_PRINT"
  "--debug"

  # Include the Material and CDK FESM bundles
  dist/releases/material/@angular/material.js
  dist/releases/cdk/@angular/cdk.js

  # Include all Angular FESM bundles.
  node_modules/@angular/core/@angular/core.js
  node_modules/@angular/common/@angular/common.js
  node_modules/@angular/compiler/@angular/compiler.js
  node_modules/@angular/forms/@angular/forms.js
  node_modules/@angular/http/@angular/http.js
  node_modules/@angular/router/@angular/router.js
  node_modules/@angular/platform-browser/@angular/platform-browser.js
  node_modules/@angular/platform-browser/@angular/platform-browser/animations.js
  node_modules/@angular/platform-browser-dynamic/@angular/platform-browser-dynamic.js
  node_modules/@angular/animations/@angular/animations.js
  node_modules/@angular/animations/@angular/animations/browser.js

  # Include other dependencies like Zone.js and RxJS
  node_modules/zone.js/dist/zone.js
  $rxjsSourceFiles

  # Include all files from the demo-app package.
  $(find dist/packages/demo-app -name '*.js')

  "--entry_point=./dist/packages/demo-app/main.js"
  "--dependency_mode=STRICT"
)

# Write closure flags to a closure flagfile.
closureFlags=$(mktemp)
echo ${OPTS[*]} > $closureFlags

# Run the Google Closure compiler java runnable.
java -jar node_modules/google-closure-compiler/compiler.jar --flagfile $closureFlags

echo "Finished bundling the dev-app using google closure compiler.."
