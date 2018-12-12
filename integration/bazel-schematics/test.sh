#!/usr/bin/env bash

set -eux -o pipefail

function test() {
  # Set up
  bazel version
  rm -rf demo
  # Create project
  ng new demo --collection=@angular/bazel --defaults --skip-git
  cd demo
  # TODO(kyliau): Use bazel commands directly for now. Once 7.1.4 is out we can
  # switch to use builders (ng build and ng test)
  # Run build
  bazel build //src:bundle
  # Run test
  bazel test \
    //src:test \
    //e2e:devserver_test \
    //e2e:prodserver_test
}

test
