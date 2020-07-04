# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")

"""
  This test verifies that a set of top level symbols from a javascript file match a gold file.
"""

def js_expected_symbol_test(name, src, golden, data = [], **kwargs):
    """This test verifies that a set of top level symbols from a javascript file match a gold file.
    """
    all_data = data + [
        src,
        golden,
        Label("//tools/symbol-extractor:lib"),
        Label("@npm//typescript"),
    ]
    entry_point = "//tools/symbol-extractor:cli.ts"

    nodejs_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        templated_args = ["$(rootpath %s)" % src, "$(rootpath %s)" % golden],
        configuration_env_vars = ["angular_ivy_enabled"],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        configuration_env_vars = ["angular_ivy_enabled"],
        templated_args = ["$(rootpath %s)" % src, "$(rootpath %s)" % golden, "--accept"],
        **kwargs
    )
