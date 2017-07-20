#!/usr/bin/env bash

set -u -e -o pipefail


# These ones can be `npm link`ed for fast development
LINKABLE_PKGS=(
  $(pwd)/dist/packages-dist/{common,forms,core,compiler,compiler-cli,platform-{browser,server},platform-browser-dynamic,router,http,animations}
  $(pwd)/dist/tools/@angular/tsc-wrapped
)

TYPESCRIPT_2_1=typescript@2.1.5
PKGS=(
  reflect-metadata@0.1.8
  zone.js@0.6.25
  rxjs@5.0.1
  @types/{node@6.0.38,jasmine@2.2.33}
  jasmine@2.4.1
  webpack@2.1.0-beta.21
  source-map-loader@0.2.0
  @angular2-material/{core,button}@2.0.0-alpha.8-1
)

TMPDIR=${TMPDIR:-.}
readonly TMP=$TMPDIR/e2e_test.$(date +%s)
mkdir -p $TMP
cp -R -v packages/compiler-cli/integrationtest/* $TMP
cp -R -v modules/benchmarks $TMP
# Try to use the same versions as angular, in particular, this will
# cause us to install the same rxjs version.
cp -v package.json $TMP

# run in subshell to avoid polluting cwd
(
  cd $TMP
  set -ex -o pipefail
  npm install ${PKGS[*]} $TYPESCRIPT_2_1
  # TODO(alexeagle): allow this to be npm link instead
  npm install ${LINKABLE_PKGS[*]}

  ./node_modules/.bin/tsc --version
  # Compile the compiler-cli third_party simulation.
  # Use ngc-wrapped directly so we don't produce *.ngfactory.ts files!

  # Compile the compiler-cli integration tests
  # TODO(vicb): restore the test for .xtb
  #./node_modules/.bin/ngc -p tsconfig-build.json --i18nFile=src/messages.fi.xtb --locale=fi --i18nFormat=xtb

  # Generate the metadata for the third-party modules
  node ./node_modules/@angular/tsc-wrapped/src/main -p third_party_src/tsconfig-build.json

  # Generate the the bundle modules
  node ./node_modules/@angular/tsc-wrapped/src/main -p flat_module/tsconfig-build.json

  # Copy the html files from source to the emitted output
  cp flat_module/src/*.html node_modules/flat_module/src

  ./node_modules/.bin/ngc -p tsconfig-build.json --i18nFile=src/messages.fi.xlf --locale=fi --i18nFormat=xlf

  ./node_modules/.bin/ng-xi18n -p tsconfig-xi18n.json --i18nFormat=xlf --locale=fr
  ./node_modules/.bin/ng-xi18n -p tsconfig-xi18n.json --i18nFormat=xlf2 --outFile=messages.xliff2.xlf
  ./node_modules/.bin/ng-xi18n -p tsconfig-xi18n.json --i18nFormat=xmb --outFile=custom_file.xmb

  # Removed until #15219 is fixed
  # node test/test_summaries.js
  node test/test_ngtools_api.js

  ./node_modules/.bin/jasmine init
  # Run compiler-cli integration tests in node
  ./node_modules/.bin/webpack ./webpack.config.js
  ./node_modules/.bin/jasmine ./all_spec.js

  # Compile again with a differently named tsconfig file
  mv tsconfig-build.json othername.json
  ./node_modules/.bin/ngc -p othername.json
)
