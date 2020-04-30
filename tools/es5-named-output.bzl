load("@build_bazel_rules_nodejs//:providers.bzl", "JSNamedModuleInfo")

"""Implementation of the es5_named_output rule.
Direct and transitive JavaScript files and sourcemaps are collected via ts_library
JSNamedModuleInfo provider.
https://github.com/bazelbuild/rules_nodejs/blob/a167311c025be2a77ba0d84e6a2ddcafe1c0564d/packages/typescript/src/internal/build_defs.bzl#L312
"""

def _es5_named_output_impl(ctx):
    depsets = []
    for dep in ctx.attr.deps:
        if JSNamedModuleInfo in dep:
            depsets.append(dep[JSNamedModuleInfo].sources)
        if hasattr(dep, "files"):
            depsets.append(dep.files)
    sources = depset(transitive = depsets)

    return [DefaultInfo(files = sources)]

"""Rule that collects all ES5 named outputs from a list of deps.
It can be used as input for all those rules that require named JavaScript sources (such as
pkg_web).
We need this because ts_library and ng_module targets output only expose the type definition files
as outputs.
"""
es5_named_output = rule(
    implementation = _es5_named_output_impl,
    attrs = {
        "deps": attr.label_list(
            allow_files = True,
        ),
    },
)
