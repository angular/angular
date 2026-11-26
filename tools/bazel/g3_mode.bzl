"""Bazel transition rule for running test targets with g3-only markers active."""

def _g3_mode_transition_impl(_settings, _attr):
    return {"//tools/bazel:g3_mode": True}

_g3_mode_transition = transition(
    implementation = _g3_mode_transition_impl,
    inputs = [],
    outputs = ["//tools/bazel:g3_mode"],
)

def _g3_test_impl(ctx):
    target = ctx.attr.target[0]
    orig_exe = target[DefaultInfo].files_to_run.executable
    exe = ctx.actions.declare_file(ctx.label.name)
    ctx.actions.symlink(
        output = exe,
        target_file = orig_exe,
        is_executable = True,
    )
    runfiles = ctx.runfiles(files = [orig_exe]).merge(target[DefaultInfo].default_runfiles)
    return [DefaultInfo(executable = exe, runfiles = runfiles)]

g3_test = rule(
    implementation = _g3_test_impl,
    test = True,
    attrs = {
        "target": attr.label(
            cfg = _g3_mode_transition,
            executable = True,
            mandatory = True,
        ),
        "_allowlist_function_transition": attr.label(
            default = "@bazel_tools//tools/allowlists/function_transition_allowlist",
        ),
    },
    doc = "Runs an existing test target with `--//tools/bazel:g3_mode=true`.",
)
