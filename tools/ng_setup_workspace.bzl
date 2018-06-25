# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"Install angular source dependencies"

load("@build_bazel_rules_nodejs//:defs.bzl", "yarn_install")

def ng_setup_workspace():
  """This repository rule should be called from your WORKSPACE file.

  It creates some additional Bazel external repositories that are used internally
  to build angular
  """
  yarn_install(
      name = "angular_deps",
      package_json = "@angular//:package.json",
      yarn_lock = "@angular//:yarn.lock",
      data = ["@angular//:tools/yarn/check-yarn.js", "@angular//:tools/postinstall-patches.js"]
  )
