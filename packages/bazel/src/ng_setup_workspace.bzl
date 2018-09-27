# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"Install toolchain dependencies"

load("@build_bazel_rules_typescript//:defs.bzl", "check_rules_typescript_version")

def ng_setup_workspace():
    """This repository rule should be called from your WORKSPACE file.

    It creates some additional Bazel external repositories that are used internally
    by the Angular rules.
    """

    # 0.16.0: minimal version required to work with ng_module
    # 0.16.2: bazel type resolution for zone.js types
    # 0.20.1: fine grained deps
    # 0.20.2: version check fix
    check_rules_typescript_version("0.20.2")
