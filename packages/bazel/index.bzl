# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
""" Public API surface is re-exported here.

Users should not load files under "/src"
"""

load("//packages/bazel/src/ng_package:ng_package.bzl", _ng_package = "ng_package_macro")
load("//packages/bazel/src/ng_module:ng_module.bzl", _ng_module = "ng_module_macro")
load("//packages/bazel/src/types_bundle:index.bzl", _types_bundle = "types_bundle")

ng_module = _ng_module
ng_package = _ng_package
types_bundle = _types_bundle

# DO NOT ADD PUBLIC API without including in the documentation generation
# Run `yarn bazel build //packages/bazel/docs` to verify
