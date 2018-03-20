#!/usr/bin/env bash

set -u -e -o pipefail

# npm 5 symlinks from local file installations rather than copying files, but
# webpack will not follow the symlinks.
# We prefer to emulate how a user will install angular, so we `npm pack` the
# packages, then install them from the resulting .tgz files later.
ANGULAR_PKGS=$(npm pack dist/packages-dist/{common,forms,core,compiler,compiler-cli,platform-{browser,server},platform-browser-dynamic,router,http,animations} | awk "{ printf \"$PWD/\"; print }")


PKGS=(
  $PWD/node_modules/typescript
  $PWD/node_modules/reflect-metadata
  $PWD/node_modules/rxjs
  $PWD/node_modules/zone.js
  @types/{node@6.0.38,jasmine@2.2.33}
  jasmine@2.4.1
  webpack@2.1.0-beta.21
  source-map-loader@0.2.0
  @angular/{material,cdk}@2.0.0-beta.10
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
  npm install ${PKGS[*]}
  npm install ${ANGULAR_PKGS[*]}

  ./node_modules/.bin/tsc --version
  # Compile the compiler-cli third_party simulation.
  # Use ngc-wrapped directly so we don't produce *.ngfactory.ts files!

  # Compile the compiler-cli integration tests
  # TODO(vicb): restore the test for .xtb
  #./node_modules/.bin/ngc -p tsconfig-build.json --i18nFile=src/messages.fi.xtb --locale=fi --i18nFormat=xtb

  # Generate the metadata for the third-party modules
  ./node_modules/.bin/ngc -p third_party_src/tsconfig-build.json

  # Generate the the bundle modules
  ./node_modules/.bin/ngc -p flat_module/tsconfig-build.json

  # Copy the html files from source to the emitted output
  cp flat_module/src/*.html node_modules/flat_module/src

  ./node_modules/.bin/ngc -p tsconfig-build.json --i18nFile=src/messages.fi.xlf --locale=fi --i18nFormat=xlf

  ./node_modules/.bin/ng-xi18n -p tsconfig-xi18n.json --i18nFormat=xlf --locale=fr
  ./node_modules/.bin/ng-xi18n -p tsconfig-xi18n.json --i18nFormat=xlf2 --outFile=messages.xliff2.xlf
  ./node_modules/.bin/ng-xi18n -p tsconfig-xi18n.json --i18nFormat=xmb --outFile=custom_file.xmb

  node test/test_ngtools_api.js

  ./node_modules/.bin/jasmine init
  # Run compiler-cli integration tests in node
  ./node_modules/.bin/webpack ./webpack.config.js
  ./node_modules/.bin/jasmine ./all_spec.js

  # Compile again with a differently named tsconfig file
  mv tsconfig-build.json othername.json
  ./node_modules/.bin/ngc -p othername.json
)
