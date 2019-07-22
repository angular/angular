# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary", "nodejs_test")

"""
  Macro that can be used to track the size of a given input file by inspecting
  the corresponding source map. A golden file is used to compare the current
  file size data against previously approved file size data
"""

def js_size_tracking_test(
        name,
        src,
        sourceMap,
        goldenFile,
        maxPercentageDiff,
        maxByteDiff,
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
        configuration_env_vars = ["compile"],
        templated_args = [src, sourceMap, goldenFile, "%d" % maxPercentageDiff, "%d" % maxByteDiff, "false"],
        **kwargs
    )

    nodejs_binary(
        name = "%s.accept" % name,
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        configuration_env_vars = ["compile"],
        templated_args = [src, sourceMap, goldenFile, "0", "0", "true"],
        **kwargs
    )
