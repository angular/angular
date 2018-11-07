# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Install Angular Material source dependencies"""

load("@build_bazel_rules_nodejs//:defs.bzl", "yarn_install")

def angular_material_setup_workspace():
  """
    This repository rule should be called from your WORKSPACE file.

    It creates some additional Bazel external repositories that are used internally
    to build Angular Material
  """
  # Use Bazel managed node modules. See more below:
  # https://github.com/bazelbuild/rules_nodejs#bazel-managed-vs-self-managed-dependencies
  # Note: The repository_rule name is `@matdeps` so it does not conflict with the `@npm` repository
  # name downstream when building Angular Material from source. In the future when Angular + Bazel
  # users can build using the @angular/material npm bundles (depends on Ivy) this can be changed
  # to `@npm`.
  yarn_install(
    name = "matdeps",
    package_json = "@angular_material//:package.json",
    # Ensure that the script is available when running `postinstall` in the Bazel sandbox.
    data = ["@angular_material//:tools/npm/check-npm.js"],
    yarn_lock = "@angular_material//:yarn.lock",
  )
