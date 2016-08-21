#!/usr/bin/env bash
set -ex -o pipefail

[[ "${TEST_SRCDIR}/angular" == "$(pwd)" ]] && [[ -n "${TEST_TMPDIR}" ]] \
    || { echo "Please run from \"bazel test\"." >&2; exit 1; }


LOCAL_PKGS=(
  "$(pwd)"/{common,core,compiler,compiler-cli,forms,platform-{browser,browser-dynamic,server},tsc-wrapped}_package.tar
)

PKGS=(
  reflect-metadata
  typescript@next
  zone.js
  rxjs
  @types/{node,jasmine}
  jasmine
  @angular2-material/{core,button}
)

# Need to use deference since TypeScript notoriously resolves symlinks, making
# sources inside rootDir check fail.
cp --dereference -R -v modules/@angular/compiler-cli/integrationtest/* "${TEST_TMPDIR}"
# Try to use the same versions as angular, in particular, this will
# cause us to install the same rxjs version.
cp --dereference -v package.json "${TEST_TMPDIR}"

# run in subshell to avoid polluting cwd
(
  set -ex -o pipefail
  cd "${TEST_TMPDIR}"
  npm install "${PKGS[@]}"
  npm install "${LOCAL_PKGS[@]}"

  ./node_modules/.bin/tsc --version
  # Compile the compiler-cli integration tests
  # TODO(vicb): restore the test for .xtb
  #./node_modules/.bin/ngc --i18nFile=src/messages.fi.xtb --locale=fi --i18nFormat=xtb
  ./node_modules/.bin/ngc --i18nFile=src/messages.fi.xlf --locale=fi --i18nFormat=xlf
  ./node_modules/.bin/ng-xi18n --i18nFormat=xlf
  ./node_modules/.bin/ng-xi18n --i18nFormat=xmb

  ./node_modules/.bin/jasmine init
  # Run compiler-cli integration tests in node
  ./node_modules/.bin/jasmine test/*_spec.js

  # Compile again with a differently named tsconfig file
  mv tsconfig.json othername.json
  ./node_modules/.bin/ngc -p othername.json
)
