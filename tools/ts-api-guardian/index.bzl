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

load("@build_bazel_rules_nodejs//internal/node:node.bzl", "nodejs_binary", "nodejs_test")

COMMON_MODULE_IDENTIFIERS = ["angular", "jasmine", "protractor"]

def ts_api_guardian_test(name, golden, actual, data = [], **kwargs):
    """Runs ts_api_guardian
    """
    data += [
        "//tools/ts-api-guardian:lib",
        "//tools/ts-api-guardian:bin/ts-api-guardian",
        "@bazel_tools//tools/bash/runfiles",
    ]

    args = [
        # Needed so that node doesn't walk back to the source directory.
        # From there, the relative imports would point to .ts files.
        "--node_options=--preserve-symlinks",
        "--stripExportPattern",
        "^\(__\|ɵ\)",
    ]
    for i in COMMON_MODULE_IDENTIFIERS:
        args += ["--allowModuleIdentifiers", i]

    nodejs_test(
        name = name,
        data = data,
        node_modules = "@ts-api-guardian_runtime_deps//:node_modules",
        entry_point = "angular/tools/ts-api-guardian/bin/ts-api-guardian",
        templated_args = args + ["--verify", golden, actual],
        testonly = 1,
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = data,
        node_modules = "@ts-api-guardian_runtime_deps//:node_modules",
        entry_point = "angular/tools/ts-api-guardian/bin/ts-api-guardian",
        templated_args = args + ["--out", golden, actual],
        **kwargs
    )
