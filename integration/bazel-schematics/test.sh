#!/usr/bin/env bash

set -eux -o pipefail

function test() {
  # Set up
  bazel version
  rm -rf demo
  # Create project
  ng new demo --collection=@angular/bazel --defaults --skip-git
  cd demo
  # Run build
  # TODO(kyliau): Use `bazel build` for now. Running `ng build` requires
  # node_modules to be available in project directory.
  bazel build //src:bundle
  # Run test
  ng test
  ng e2e
}

test
