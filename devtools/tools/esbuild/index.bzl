load("//devtools:packages.bzl", "ANGULAR_PACKAGES")
load("@npm//@angular/build-tooling/bazel/esbuild:index.bzl", "esbuild")
load("@build_bazel_rules_nodejs//internal/linker:link_node_modules.bzl", "LinkerPackageMappingInfo")
load("@build_bazel_rules_nodejs//:providers.bzl", "ExternalNpmPackageInfo", "JSModuleInfo")

"""
  Starlark file exposing a definition for generating Angular linker-processed ESM bundles
  for all entry-points the Angular framework packages expose.

  These linker-processed ESM bundles are useful as they can be integrated into the
  spec bundling, or dev-app to avoid unnecessary re-linking of framework entry-points
  every time the bundler executes. This helps with the overall development turnaround and
  is more idiomatic as it allows caching of the Angular framework packages.
"""

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

_linker_mapping = rule(
    implementation = _linker_mapping_impl,
    attrs = {
        "package": attr.label(),
        "srcs": attr.label_list(allow_files = False),
        "subpath": attr.string(),
        "module_name": attr.string(),
    },
)

def _get_target_name_base(pkg, entry_point):
    return "%s%s" % (pkg.name, "_%s" % entry_point if entry_point else "")

def _create_bundle_targets(pkg, entry_point, module_name):
    target_name_base = _get_target_name_base(pkg, entry_point)
    fesm_bundle_path = "fesm2022/%s.mjs" % (entry_point if entry_point else pkg.name)

    esbuild(
        name = "%s_linked_bundle" % target_name_base,
        output = "%s/index.mjs" % target_name_base,
        platform = pkg.platform,
        entry_point = "@npm//:node_modules/@angular/%s/%s" % (pkg.name, fesm_bundle_path),
        config = "//devtools/tools/esbuild:esbuild_config_esm",
        # List of dependencies which should never be bundled into these linker-processed bundles.
        external = ["rxjs", "@angular", "domino", "xhr2", "@material"],
    )

    _linker_mapping(
        name = "%s_linked" % target_name_base,
        srcs = [":%s_linked_bundle" % target_name_base],
        package = "@npm//@angular/%s" % pkg.name,
        module_name = module_name,
        subpath = target_name_base,
    )

def create_angular_bundle_targets():
    for pkg in ANGULAR_PACKAGES:
        _create_bundle_targets(pkg, None, pkg.module_name)

        for entry_point in pkg.entry_points:
            _create_bundle_targets(pkg, entry_point, "%s/%s" % (pkg.module_name, entry_point))

LINKER_PROCESSED_FW_PACKAGES = [
    "//devtools/tools/esbuild:%s_linked" % _get_target_name_base(pkg, entry_point)
    for pkg in ANGULAR_PACKAGES
    for entry_point in [None] + pkg.entry_points
]
