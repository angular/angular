"""Starlark file that exposes a rule for extracting type definitions of dependencies."""

load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo")

def _extract_typings_rule_impl(ctx):
    """Implementation of the `extract_typings` rule."""
    transitive_depsets = []

    for dep in ctx.attr.deps:
        # Based on whether declarations should be collected, extract direct
        # and transitive declaration files using the `DeclarationInfo` provider.
        if DeclarationInfo in dep:
            transitive_depsets.append(dep[DeclarationInfo].transitive_declarations)

    return [DefaultInfo(files = depset(transitive = transitive_depsets))]

extract_typings = rule(
    implementation = _extract_typings_rule_impl,
    doc = """Rule that extracts all transitive typings of dependencies""",
    attrs = {
        "deps": attr.label_list(
            allow_files = True,
        ),
    },
)
