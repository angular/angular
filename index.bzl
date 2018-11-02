# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
""" Public API surface is re-exported here.

This API is exported for users building angular from source in downstream
projects. The rules from packages/bazel are re-exported here as well
as the ng_setup_workspace repository rule needed when building angular
from source downstream. Alternately, this API is available from the
@angular/bazel npm package if the npm distribution of angular is
used in a downstream project.
"""

load(
    "//packages/bazel:index.bzl",
    _ng_module = "ng_module",
    _ng_package = "ng_package",
    _protractor_web_test = "protractor_web_test",
    _protractor_web_test_suite = "protractor_web_test_suite",
)
load("//tools:ng_setup_workspace.bzl", _ng_setup_workspace = "ng_setup_workspace")

ng_module = _ng_module
ng_package = _ng_package
protractor_web_test = _protractor_web_test
protractor_web_test_suite = _protractor_web_test_suite
ng_setup_workspace = _ng_setup_workspace
