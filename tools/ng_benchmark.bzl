# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Bazel macro for running Angular benchmarks"""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

def ng_benchmark(name, bundle):
    """

    This macro creates two targets, one that is runnable and prints results and one that can be used for profiling via chrome://inspect.

    Args:
      name: name of the runnable rule to create
      bundle: label of the ng_rollup_bundle to run
    """

    nodejs_binary(
        name = name,
        data = [bundle],
        entry_point = bundle + ".min_debug.js",
        tags = ["local", "manual"],  # run benchmarks locally and never on CI
    )

    nodejs_binary(
        name = name + "_profile",
        data = [bundle],
        entry_point = bundle + ".min_debug.js",
        args = ["--node_options=--no-turbo-inlining --node_options=--inspect-brk"],
        tags = ["local", "manual"],  # run benchmarks locally and never on CI
    )
