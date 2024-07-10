# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("//tools:defaults.bzl", "nodejs_test")

MADGE_CONFIG_LABEL = "//tools/circular_dependency_test:madge-resolve.config.js"

"""
  Creates a test target that ensures that no circular dependencies can
  be found in the given entry point file.
"""

def circular_dependency_test(name, deps, entry_point, **kwargs):
    nodejs_test(
        name = name,
        data = ["@npm//madge", MADGE_CONFIG_LABEL] + deps,
        entry_point = "@npm//:node_modules/madge/bin/cli.js",
        templated_args = [
            "--circular",
            "--no-spinner",
            # NOTE: We cannot use `$(rootpath)` to resolve labels. This is because `ts_library`
            # does not pre-declare outputs in the rule. Hence, the outputs cannot be referenced
            # through labels (i.e. `//packages/core:index.js`). Read more here:
            # https://docs.bazel.build/versions/2.0.0/skylark/rules.html#outputs
            # TODO: revisit once https://github.com/bazelbuild/rules_nodejs/issues/1563 is solved.
            "$$(rlocation %s)" % entry_point,
            # Madge supports custom module resolution, but expects a configuration file
            # similar to a Webpack configuration file setting the `resolve` option.
            "--webpack-config",
            "$$(rlocation $(rootpath %s))" % MADGE_CONFIG_LABEL,
        ],
        testonly = 1,
        expected_exit_code = 0,
        **kwargs
    )
