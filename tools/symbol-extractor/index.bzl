# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.dev/license

load("//tools:defaults2.bzl", "js_binary", "js_test")

"""
  This test verifies that a set of top level symbols from a javascript file match a gold file.
"""

def js_expected_symbol_test(name, bundles_dir, golden, data = [], **kwargs):
    """This test verifies that a set of top level symbols from a javascript file match a gold file.
    """
    all_data = data + [
        Label("//tools/symbol-extractor:lib_rjs"),
        bundles_dir,
        golden,
    ]
    entry_point = "//tools/symbol-extractor:cli.mjs"

    js_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        tags = kwargs.pop("tags", []) + ["symbol_extractor"],
        fixed_args = ["$(rootpath %s)" % bundles_dir, "$(rootpath %s)" % golden],
        **kwargs
    )

    js_binary(
        name = name + ".accept",
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        fixed_args = ["$(rootpath %s)" % bundles_dir, "$(rootpath %s)" % golden, "--accept"],
        **kwargs
    )
