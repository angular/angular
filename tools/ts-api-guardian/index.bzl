# Copyright 2017 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Runs ts_api_guardian
"""

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")

COMMON_MODULE_IDENTIFIERS = ["angular", "jasmine", "protractor", "Symbol"]

def ts_api_guardian_test(
        name,
        golden,
        actual,
        data = [],
        strip_export_pattern = [],
        allow_module_identifiers = COMMON_MODULE_IDENTIFIERS,
        use_angular_tag_rules = True,
        **kwargs):
    """Runs ts_api_guardian
    """
    data += [
        # Locally we need to add the TS build target
        # But it will replaced to @npm//ts-api-guardian when publishing
        "@angular//tools/ts-api-guardian:lib",
        # BEGIN-INTERNAL
        "@angular//tools/ts-api-guardian:bin",
        # END-INTERNAL
        # The below are required during runtime
        "@npm//chalk",
        "@npm//diff",
        "@npm//minimist",
        "@npm//typescript",
    ]

    args = [
        # Needed so that node doesn't walk back to the source directory.
        # From there, the relative imports would point to .ts files.
        "--node_options=--preserve-symlinks",
        # TODO(josephperrott): update dependency usages to no longer need bazel patch module resolver
        # See: https://github.com/bazelbuild/rules_nodejs/wiki#--bazel_patch_module_resolver-now-defaults-to-false-2324
        "--bazel_patch_module_resolver",
    ]

    for i in strip_export_pattern:
        # Quote the regexp before passing it via the command line.
        quoted_pattern = "\"%s\"" % i
        args += ["--stripExportPattern", quoted_pattern]

    for i in allow_module_identifiers:
        args += ["--allowModuleIdentifiers", i]

    if use_angular_tag_rules:
        args += ["--useAngularTagRules"]

    nodejs_test(
        name = name,
        data = data,
        entry_point = Label("@angular//tools/ts-api-guardian:bin/ts-api-guardian"),
        tags = kwargs.pop("tags", []) + ["api_guard"],
        templated_args = args + ["--verify", golden, actual],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = data,
        entry_point = Label("@angular//tools/ts-api-guardian:bin/ts-api-guardian"),
        tags = kwargs.pop("tags", []) + ["api_guard"],
        templated_args = args + ["--out", golden, actual],
        **kwargs
    )

def ts_api_guardian_test_npm_package(
        name,
        goldenDir,
        actualDir,
        data = [],
        strip_export_pattern = ["^ɵ(?!ɵdefineInjectable|ɵinject|ɵInjectableDef)"],
        allow_module_identifiers = COMMON_MODULE_IDENTIFIERS,
        use_angular_tag_rules = True,
        **kwargs):
    """Runs ts_api_guardian
    """
    data += [
        # Locally we need to add the TS build target
        # But it will replaced to @npm//ts-api-guardian when publishing
        "@angular//tools/ts-api-guardian:lib",
        "@angular//tools/ts-api-guardian:bin",
        # The below are required during runtime
        "@npm//chalk",
        "@npm//diff",
        "@npm//minimist",
        "@npm//typescript",
    ]

    args = [
        # Needed so that node doesn't walk back to the source directory.
        # From there, the relative imports would point to .ts files.
        "--node_options=--preserve-symlinks",
        # We automatically discover the enpoints for our NPM package.
        "--autoDiscoverEntrypoints",
        # TODO(josephperrott): update dependency usages to no longer need bazel patch module resolver
        # See: https://github.com/bazelbuild/rules_nodejs/wiki#--bazel_patch_module_resolver-now-defaults-to-false-2324
        "--bazel_patch_module_resolver",
    ]

    for i in strip_export_pattern:
        # Quote the regexp before passing it via the command line.
        quoted_pattern = "\"%s\"" % i
        args += ["--stripExportPattern", quoted_pattern]

    for i in allow_module_identifiers:
        args += ["--allowModuleIdentifiers", i]

    if use_angular_tag_rules:
        args += ["--useAngularTagRules"]

    nodejs_test(
        name = name,
        data = data,
        entry_point = "@angular//tools/ts-api-guardian:bin/ts-api-guardian",
        tags = kwargs.pop("tags", []) + ["api_guard"],
        templated_args = args + ["--autoDiscoverEntrypoints", "--verifyDir", goldenDir, "--rootDir", "$(rlocation %s)" % actualDir],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = data,
        entry_point = "@angular//tools/ts-api-guardian:bin/ts-api-guardian",
        tags = kwargs.pop("tags", []) + ["api_guard"],
        templated_args = args + ["--autoDiscoverEntrypoints", "--outDir", goldenDir, "--rootDir", "$(rlocation %s)" % actualDir],
        **kwargs
    )
