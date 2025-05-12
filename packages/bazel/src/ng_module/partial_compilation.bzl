# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.dev/license

NgPartialCompilationInfo = provider(
    fields = {"enabled": "Whether partial compilation is enabled."},
)

def _ng_partial_compilation_flag_impl(ctx):
    return NgPartialCompilationInfo(enabled = ctx.build_setting_value)

ng_partial_compilation_flag = rule(
    implementation = _ng_partial_compilation_flag_impl,
    build_setting = config.bool(flag = True),
)

def _partial_compilation_transition_impl(_settings, _attr):
    return {
        "@rules_angular//src/ng_project/config:partial_compilation": True,
        "//packages/bazel/src:partial_compilation": True,
    }

partial_compilation_transition = transition(
    implementation = _partial_compilation_transition_impl,
    inputs = [],
    outputs = [
        "//packages/bazel/src:partial_compilation",
        "@rules_angular//src/ng_project/config:partial_compilation",
    ],
)
