#!/usr/bin/env bash
set -ex -o pipefail

# These ones can be `npm link`ed for fast development
LINKABLE_PKGS=(
  $(pwd)/dist/packages-dist/{common,forms,core,compiler,compiler-cli,platform-{browser,server},platform-browser-dynamic}
  $(pwd)/dist/tools/@angular/tsc-wrapped
)
PKGS=(
  reflect-metadata@0.1.8
  typescript@2.0.2
  zone.js@0.6.21
  rxjs@5.0.0-beta.11
  @types/{node@6.0.38,jasmine@2.2.33}
  jasmine@2.4.1
  webpack@2.1.0-beta.21
  @angular2-material/{core,button}@2.0.0-alpha.8-1
)

TMPDIR=${TMPDIR:-.}
readonly TMP=$TMPDIR/e2e_test.$(date +%s)
mkdir -p $TMP
cp -R -v modules/@angular/compiler-cli/integrationtest/* $TMP
# Try to use the same versions as angular, in particular, this will
# cause us to install the same rxjs version.
cp -v package.json $TMP

# run in subshell to avoid polluting cwd
(
  cd $TMP
  set -ex -o pipefail
  npm install ${PKGS[*]}
  # TODO(alexeagle): allow this to be npm link instead
  npm install ${LINKABLE_PKGS[*]}

  ./node_modules/.bin/tsc --version
  # Compile the compiler-cli integration tests
  # TODO(vicb): restore the test for .xtb
  #./node_modules/.bin/ngc --i18nFile=src/messages.fi.xtb --locale=fi --i18nFormat=xtb
  ./node_modules/.bin/ngc --i18nFile=src/messages.fi.xlf --locale=fi --i18nFormat=xlf
  ./node_modules/.bin/ng-xi18n --i18nFormat=xlf
  ./node_modules/.bin/ng-xi18n --i18nFormat=xmb

  ./node_modules/.bin/jasmine init
  # Run compiler-cli integration tests in node
  ./node_modules/.bin/webpack ./webpack.config.js
  ./node_modules/.bin/jasmine ./all_spec.js

  # Compile again with a differently named tsconfig file
  mv tsconfig.json othername.json
  ./node_modules/.bin/ngc -p othername.json
)
