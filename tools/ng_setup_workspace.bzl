# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"Install angular source dependencies"

load("@build_bazel_rules_nodejs//:defs.bzl", "yarn_install")
load("@angular//packages/bazel/src:ng_setup_workspace.bzl", _ng_setup_workspace = "ng_setup_workspace")

def ng_setup_workspace():
    """This repository rule should be called from your WORKSPACE file.

    It creates some additional Bazel external repositories that are used internally
    to build angular
    """
    yarn_install(
        name = "ngdeps",
        package_json = "@angular//:package.json",
        yarn_lock = "@angular//:yarn.lock",
        data = ["@angular//:tools/yarn/check-yarn.js", "@angular//:tools/postinstall-patches.js"],
    )

    yarn_install(
        name = "ts-api-guardian_runtime_deps",
        package_json = "@angular//tools/ts-api-guardian:package.json",
        yarn_lock = "@angular//tools/ts-api-guardian:yarn.lock",
    )

    yarn_install(
        name = "http-server_runtime_deps",
        package_json = "@angular//tools/http-server:package.json",
        yarn_lock = "@angular//tools/http-server:yarn.lock",
    )

    _ng_setup_workspace()
