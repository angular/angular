#!/usr/bin/env bash
set -ex -o pipefail

[[ "${TEST_SRCDIR}/angular" == "$(pwd)" ]] && [[ -n "${TEST_TMPDIR}" ]] \
    || { echo "Please run from \"bazel test\"." >&2; exit 1; }


# Note that compiler-cli does not support TS 1.8 because tsc-wrapped uses 1.9 features
LOCAL_PKGS=(
  "$(pwd)"/{common,core,compiler,forms,http,platform-{browser,browser-dynamic,server},router,upgrade}_package.tar
)

cp -R -v tools/typings-test/* "${TEST_TMPDIR}"

# run in subshell to avoid polluting cwd
(
  set -ex -o pipefail
  cd "${TEST_TMPDIR}"
  # create package.json so that npm install doesn't pollute any parent node_modules's directory
  npm init --yes
  npm install "${LOCAL_PKGS[@]}"
  npm install @types/es6-promise @types/es6-collections @types/jasmine rxjs@5.0.0-beta.11
  npm install typescript@1.8.10
  $(npm bin)/tsc --version
  $(npm bin)/tsc -p tsconfig.json
)
