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
  "--js_module_root=node_modules"
  "--js_module_root=vendor"

  # Uncomment for easier debugging
  # "--formatting=PRETTY_PRINT"

  node_modules/zone.js/dist/zone.js
  $(find -L vendor/rxjs -name *.js)
  node_modules/@angular/{core,common,compiler,platform-browser}/index.js
  $(find node_modules/@angular/{core,common,compiler,platform-browser}/src -name *.js)
  "built/*.js"
  "--entry_point=./built/main"
)

java -jar node_modules/google-closure-compiler/compiler.jar $(echo ${CLOSURE_ARGS[*]})
gzip -f dist/bundle.js
ls -alH dist/bundle*

# TODO(alexeagle): add an e2e test that the application works in a browser
