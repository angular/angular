# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
""" Public API surface is re-exported here.

Users should not load files under "/src"
"""

load("//packages/bazel/src/ng_package:ng_package.bzl", _ng_package = "ng_package")
load(
    "//packages/bazel/src/protractor:protractor_web_test.bzl",
    _protractor_web_test = "protractor_web_test",
    _protractor_web_test_suite = "protractor_web_test_suite",
)
load("//packages/bazel/src:ng_module.bzl", _ng_module = "ng_module_macro")

ng_module = _ng_module
ng_package = _ng_package
protractor_web_test = _protractor_web_test
protractor_web_test_suite = _protractor_web_test_suite
# DO NOT ADD PUBLIC API without including in the documentation generation
# Run `yarn bazel build //packages/bazel/docs` to verify

def ng_setup_workspace():
    print("""DEPRECATION WARNING:
    ng_setup_workspace is no longer needed, and will be removed in a future release.
    We assume you will fetch rules_nodejs in your WORKSPACE file, and no other dependencies remain here.
    Simply remove any calls to this function and the corresponding load statement.
    """)
