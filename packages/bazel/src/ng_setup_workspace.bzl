# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
""" Sets up the workspace dependencies in the user-land workspace
"""

load("@build_bazel_rules_nodejs//:defs.bzl", "npm_install")

def ng_setup_workspace():

  npm_install(
      name = "angular_deps",
      package_json = "//packages/bazel:package-deps.json",
  )