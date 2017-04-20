#!/usr/bin/env bash

# Build a folder using angular ES6 and the closure compiler

set -e -o pipefail

# The ES6 distro we built for rxjs works only in the browser, not in nodejs.
# Since we installed rxjs in node_modules for ngc to use, we have to point
# to the alternate distro when compiling with closure.
rm -rf vendor
mkdir vendor
cp -pr ../rxjs/dist/es6 vendor/rxjs

CLOSURE_ARGS=(
  "--language_in=ES6_STRICT"
  "--language_out=ES5"
  "--compilation_level=ADVANCED_OPTIMIZATIONS"
  "--warning_level=QUIET"
  "--js_output_file=dist/bundle.js"
  "--create_source_map=%outname%.map"
  "--variable_renaming_report=dist/variable_renaming_report"
  "--property_renaming_report=dist/property_renaming_report"

  # Don't include ES6 polyfills
  "--rewrite_polyfills=false"

  # List of path prefixes to be removed from ES6 & CommonJS modules.
  "--js_module_root=node_modules/@angular/core"
  "--js_module_root=node_modules/@angular/common"
  "--js_module_root=node_modules/@angular/compiler"
  "--js_module_root=node_modules/@angular/platform-browser"
  "--js_module_root=vendor"

  # Uncomment for easier debugging
  # "--formatting=PRETTY_PRINT"

  node_modules/@angular/core/src/testability/testability.externs.js
  node_modules/zone.js/dist/zone.js
  $(find -L vendor/rxjs -name *.js)
  node_modules/@angular/core/@angular/core.js
  node_modules/@angular/common/@angular/common.js
  node_modules/@angular/compiler/@angular/compiler.js
  node_modules/@angular/platform-browser/@angular/platform-browser.js
  "built/src/*.js"
  "--entry_point=./built/src/main"
)

java -jar node_modules/google-closure-compiler/compiler.jar $(echo ${CLOSURE_ARGS[*]})
# gzip on Travis doesn't have --keep option so copy the original file first
cp dist/bundle.js dist/bundle.tmp
gzip -f dist/bundle.js
mv dist/bundle.tmp dist/bundle.js
ls -alH dist/bundle*
