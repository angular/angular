# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.dev/license
"""Bazel macro for running Angular benchmarks"""

load("//tools:defaults.bzl", "js_binary")

def ng_benchmark(name, bundle):
    """

    This macro creates two targets, one that is runnable and prints results and one that can be used for profiling via chrome://inspect.

    Args:
      name: name of the runnable rule to create
      bundle: label of the bundle rule to run
    """

    js_binary(
        name = name,
        data = [bundle],
        entry_point = bundle + ".debug.min.js",
        tags = ["local", "manual"],  # run benchmarks locally and never on CI
    )

    js_binary(
        name = name + "_profile",
        data = [bundle],
        entry_point = bundle + ".debug.min.js",
        args = ["--node_options=--no-turbo-inlining --node_options=--inspect-brk"],
        tags = ["local", "manual"],  # run benchmarks locally and never on CI
    )
