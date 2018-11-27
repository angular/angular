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

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary", "nodejs_test")

COMMON_MODULE_IDENTIFIERS = ["angular", "jasmine", "protractor"]

def ts_api_guardian_test(
        name,
        golden,
        actual,
        data = [],
        strip_export_pattern = ["^__", "^ɵ"],
        allow_module_identifiers = COMMON_MODULE_IDENTIFIERS,
        use_angular_tag_rules = True,
        **kwargs):
    """Runs ts_api_guardian
    """
    data += [
        "@angular//tools/ts-api-guardian:lib",
        "@angular//tools/ts-api-guardian:bin/ts-api-guardian",
    ]

    args = [
        # Needed so that node doesn't walk back to the source directory.
        # From there, the relative imports would point to .ts files.
        "--node_options=--preserve-symlinks",
    ]

    for i in strip_export_pattern:
        args += ["--stripExportPattern", i]

    for i in allow_module_identifiers:
        args += ["--allowModuleIdentifiers", i]

    if use_angular_tag_rules:
        args += ["--useAngularTagRules"]

    nodejs_test(
        name = name,
        data = data,
        node_modules = "@ts-api-guardian_deps//:node_modules",
        entry_point = "angular/tools/ts-api-guardian/bin/ts-api-guardian",
        templated_args = args + ["--verify", golden, actual],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = data,
        node_modules = "@ts-api-guardian_deps//:node_modules",
        entry_point = "angular/tools/ts-api-guardian/bin/ts-api-guardian",
        templated_args = args + ["--out", golden, actual],
        **kwargs
    )
