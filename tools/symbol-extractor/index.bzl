# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""This test verifies that a set of top level symbols from a javascript file match a gold file.
"""

# This does a deep import under //internal because of not wanting the wrapper macro
# because it introduces an extra target_bin target.
load("@build_bazel_rules_nodejs//internal/node:node.bzl", "nodejs_binary", "nodejs_test")

def js_expected_symbol_test(name, src, golden, **kwargs):
    """This test verifies that a set of top level symbols from a javascript file match a gold file.
    """
    all_data = [src, golden]
    all_data += [Label("//tools/symbol-extractor:lib")]
    all_data += [Label("@bazel_tools//tools/bash/runfiles")]
    entry_point = "angular/tools/symbol-extractor/cli.js"

    nodejs_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        templated_args = ["$(location %s)" % src, "$(location %s)" % golden],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        templated_args = ["$(location %s)" % src, "$(location %s)" % golden, "--accept"],
        **kwargs
    )
