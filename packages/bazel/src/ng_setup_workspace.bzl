# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"Install toolchain dependencies"

load("@build_bazel_rules_nodejs//:defs.bzl", "yarn_install")
load("@build_bazel_rules_typescript//:defs.bzl", "check_rules_typescript_version")

def ng_setup_workspace():
    """This repository rule should be called from your WORKSPACE file.

    It creates some additional Bazel external repositories that are used internally
    by the Angular rules.
    """
    yarn_install(
        name = "angular_packager_deps",
        package_json = "@angular//packages/bazel/src/ng_package:package.json",
        yarn_lock = "@angular//packages/bazel/src/ng_package:yarn.lock",
    )

    # 0.16.0: minimal version required to work with ng_module
    check_rules_typescript_version("0.16.0")
