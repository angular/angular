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

load("@build_bazel_rules_typescript//:defs.bzl", "ts_library", "nodejs_binary")

licenses(["notice"])  # Apache 2.0

ts_library(
    name = "ngc_lib",
    srcs = ["index.ts"],
    tsconfig = ":tsconfig.json",
    deps = [
        "//packages/compiler-cli",
        "@build_bazel_rules_typescript//internal/tsc_wrapped"
    ],
)

nodejs_binary(
    name = "ngc-wrapped",
    entry_point = "__main__/tools/ngc-wrapped/index.js",
    data = [":ngc_lib"],
    visibility = ["//visibility:public"],
)
