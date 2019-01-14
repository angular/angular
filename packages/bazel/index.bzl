# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
""" Public API surface is re-exported here.

Users should not load files under "/src"
"""

load("//packages/bazel/src:ng_module.bzl", _ng_module = "ng_module")
load("//packages/bazel/src:ng_setup_workspace.bzl", _ng_setup_workspace = "ng_setup_workspace")
load("//packages/bazel/src/ng_package:ng_package.bzl", _ng_package = "ng_package")
load(
    "//packages/bazel/src/protractor:protractor_web_test.bzl",
    _protractor_web_test = "protractor_web_test",
    _protractor_web_test_suite = "protractor_web_test_suite",
)

ng_module = _ng_module
ng_package = _ng_package
protractor_web_test = _protractor_web_test
protractor_web_test_suite = _protractor_web_test_suite
ng_setup_workspace = _ng_setup_workspace
# DO NOT ADD PUBLIC API without including in the documentation generation
# Run `yarn bazel build //packages/bazel/docs` to verify
