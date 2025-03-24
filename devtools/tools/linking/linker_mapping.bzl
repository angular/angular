load("@build_bazel_rules_nodejs//:providers.bzl", "ExternalNpmPackageInfo", "JSModuleInfo")
load("@build_bazel_rules_nodejs//internal/linker:link_node_modules.bzl", "LinkerPackageMappingInfo")

def _linker_mapping_impl(ctx):
    return [
        # Pass through the `ExternalNpmPackageInfo` which is needed for the linker
        # resolving dependencies which might be external. e.g. `rxjs` for `@angular/core`.
        ctx.attr.package[ExternalNpmPackageInfo],
        JSModuleInfo(
            direct_sources = depset(ctx.files.srcs),
            sources = depset(ctx.files.srcs),
        ),
        LinkerPackageMappingInfo(
            mappings = depset([
                struct(
                    package_name = ctx.attr.module_name,
                    package_path = "",
                    link_path = "%s/%s" % (ctx.label.package, ctx.attr.subpath),
                ),
            ]),
            node_modules_roots = depset([]),
        ),
    ]

linker_mapping = rule(
    implementation = _linker_mapping_impl,
    attrs = {
        "package": attr.label(),
        "srcs": attr.label_list(allow_files = False),
        "subpath": attr.string(),
        "module_name": attr.string(),
    },
)
