# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")

"""
  Macro that can be used to track the size of a given input file by inspecting
  the corresponding source map. A golden file is used to compare the current
  file size data against previously approved file size data
"""

def js_size_tracking_test(
        name,
        src,
        source_map,
        golden_file,
        max_percentage_diff,
        max_byte_diff,
        angular_ivy_enabled = "False",
        data = [],
        **kwargs):
    all_data = data + [
        "//tools/size-tracking",
        "@npm//source-map",
        "@npm//chalk",
    ]
    entry_point = "//tools/size-tracking:index.ts"

    nodejs_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        configuration_env_vars = ["angular_ivy_enabled"],
        templated_args = [
            src,
            source_map,
            golden_file,
            "%d" % max_percentage_diff,
            "%d" % max_byte_diff,
            "false",
            angular_ivy_enabled,
        ],
        **kwargs
    )

    nodejs_binary(
        name = "%s.accept" % name,
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        configuration_env_vars = ["angular_ivy_enabled"],
        templated_args = [src, source_map, golden_file, "0", "0", "true", angular_ivy_enabled],
        **kwargs
    )
