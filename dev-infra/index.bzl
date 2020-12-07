# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")

# This file continues to serve as indicator for `rules_nodejs` and instructs it  preserve the
# content output in the NPM install workspace. This allows consumers to use rules and targets from
# within Bazel. e.g. by using `@npm//@angular/dev-infra-private/<..>`.
# See: https://github.com/bazelbuild/rules_nodejs/commit/4f508b1a0be1f5444e9c13b0439e649449792fef.

def ng_dev_rolled_up_generated_file(name, entry_point, deps = [], rollup_args = []):
    """Rollup and generated file test macro.

    This provides a single macro to create a rollup bundled script and a generated file test for the
    created script to ensure it stays up to date in the repository.
    """
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
