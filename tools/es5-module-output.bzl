load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo")

"""Implementation of the es5_module_output rule.
Direct and transitive JavaScript files and sourcemaps are collected via ts_library
JSModuleInfo provider.
https://github.com/bazelbuild/rules_nodejs/blob/stable/packages/typescript/internal/build_defs.bzl#L334-L337
"""

def _es5_module_output_impl(ctx):
    depsets = []
    for dep in ctx.attr.deps:
        if JSModuleInfo in dep:
            depsets.append(dep[JSModuleInfo].sources)
        if hasattr(dep, "files"):
            depsets.append(dep.files)
    sources = depset(transitive = depsets)

    return [DefaultInfo(files = sources)]

"""Rule that collects all ES5 module outputs from a list of deps.
It can be used as input for all those rules that require named JavaScript sources (such as
pkg_web).
We need this because ts_library and ng_module targets output only expose the type definition files
as outputs.
"""
es5_module_output = rule(
    implementation = _es5_module_output_impl,
    attrs = {
        "deps": attr.label_list(
            allow_files = True,
        ),
    },
)
