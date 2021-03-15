# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load(":ng_module.bzl", "NgPerfInfo")

def _ng_perf_flag_impl(ctx):
    return NgPerfInfo(enable_perf_logging = ctx.build_setting_value)

# `ng_perf_flag` is a special `build_setting` rule which ultimately enables a command-line boolean
# flag to control whether the `ng_module` rule produces performance tracing JSON files (in Ivy mode)
# as declared outputs.
#
# It does this via the `NgPerfInfo` provider and the `perf_flag` attriubute on `ng_module`. For more
# details, see: https://docs.bazel.build/versions/master/skylark/config.html
ng_perf_flag = rule(
    implementation = _ng_perf_flag_impl,
    build_setting = config.bool(flag = True),
)
