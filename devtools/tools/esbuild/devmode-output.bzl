load("@build_bazel_rules_nodejs//internal/linker:link_node_modules.bzl", "LinkerPackageMappingInfo", "module_mappings_aspect")
load("@build_bazel_rules_nodejs//:providers.bzl", "ExternalNpmPackageInfo", "JSModuleInfo", "node_modules_aspect")

def _extract_devmode_sources_impl(ctx):
    """Private rule that extracts devmode sources for all direct dependencies and re-exposes
      them as part of a single target. External node modules are passed-through as well."""

    mappings = {}
    js_sources = []

    for dep in ctx.attr.deps:
        if JSModuleInfo in dep:
            js_sources.append(dep[JSModuleInfo].sources)
        if ExternalNpmPackageInfo in dep:
            js_sources.append(dep[ExternalNpmPackageInfo].sources)
        if LinkerPackageMappingInfo in dep:
            mappings.update(dep[LinkerPackageMappingInfo].mappings)

    return [
        LinkerPackageMappingInfo(mappings = mappings),
        JSModuleInfo(
            direct_sources = depset(transitive = js_sources),
            sources = depset(transitive = js_sources),
        ),
    ]

extract_devmode_sources = rule(
    implementation = _extract_devmode_sources_impl,
    attrs = {
        "deps": attr.label_list(mandatory = True, aspects = [module_mappings_aspect, node_modules_aspect]),
    },
)

def extract_devmode_output_with_mappings(name, deps, testonly):
    """Macro that extracts devmode ESM2020 sources from the given dependencies."""

    extract_devmode_sources(
        name = "%s_sources" % name,
        testonly = testonly,
        deps = deps,
    )

    return ["%s_sources" % name]
