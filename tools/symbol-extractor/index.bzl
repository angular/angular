# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("//tools:defaults.bzl", "nodejs_binary", "nodejs_test")

"""
  This test verifies that a set of top level symbols from a javascript file match a gold file.
"""

def js_expected_symbol_test(name, src, golden, data = [], **kwargs):
    """This test verifies that a set of top level symbols from a javascript file match a gold file.
    """
    all_data = data + [
        Label("//tools/symbol-extractor:lib"),
        Label("@npm//typescript"),
        src,
        golden,
    ]
    entry_point = "//tools/symbol-extractor:cli.ts"

    nodejs_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        tags = kwargs.pop("tags", []) + ["symbol_extractor"],
        templated_args = ["$(rootpath %s)" % src, "$(rootpath %s)" % golden],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        templated_args = ["$(rootpath %s)" % src, "$(rootpath %s)" % golden, "--accept"],
        **kwargs
    )
