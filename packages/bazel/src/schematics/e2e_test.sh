#!/usr/bin/env bash

set -eux -o pipefail

readonly bazel="${TEST_TMPDIR}/node_modules/@bazel/bazel-*/bazel-*"
readonly ng="${TEST_TMPDIR}/node_modules/.bin/ng"
readonly node="${TEST_SRCDIR}/nodejs/bin/node"
readonly yarn="${TEST_SRCDIR}/nodejs/bin/yarn"

function installDevDependencies() {
  local npm_package="${TEST_SRCDIR}/angular/packages/bazel/npm_package"
  if hash realpath; then
    local angular_bazel=$(realpath "${npm_package}")
  else
    local angular_bazel=$(readlink "${npm_package}")
  fi
  cd "${TEST_TMPDIR}"
  "${yarn}" init --yes
  # TODO(kyliau): Remove @angular/core when angular 7.1.4 is out
  "${yarn}" add --dev --silent \
    @angular/core \
    @angular/cli \
    @bazel/bazel \
    file:"${angular_bazel}"
}

function createProject() {
  cd "${TEST_TMPDIR}"
  "${node}" "${ng}" new demo --collection=@angular/bazel --defaults --skip-git
}

function runBuild() {
  cd "${TEST_TMPDIR}/demo"
  ${bazel} build //src:bundle.min.js
}

function runTest() {
  cd "${TEST_TMPDIR}/demo"
  ${bazel} test \
    //src:test \
    //e2e:devserver_test \
    //e2e:prodserver_test
}

function test() {
  installDevDependencies
  createProject
  runBuild
  runTest
}

test
