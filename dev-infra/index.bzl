# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")

def ng_dev_rolled_up_generated_file(name, entry_point, deps = [], rollup_args = []):
    rollup_bundle(
        name = "%s_bundle" % name,
        args = rollup_args,
        entry_point = entry_point,
        format = "cjs",
        silent = True,
        sourcemap = "false",
        deps = deps,
    )

    generated_file_test(
        name = name,
        src = "%s.js" % name,
        generated = "%s_bundle" % name,
    )
