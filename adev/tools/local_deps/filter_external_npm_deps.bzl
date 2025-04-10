"""Rule for filtering external NPM dependency targets to not include
transitive dependencies onto first-party linked `HEAD` dependencies."""

load("@build_bazel_rules_nodejs//:providers.bzl", "ExternalNpmPackageInfo", "LinkablePackageInfo")

def _filter_external_npm_deps_impl(ctx):
    problematic_paths = ["external/npm/node_modules/%s" % pkg for pkg in ctx.attr.angular_packages]
    package_name = ctx.attr.target.label.package
    has_problematic_transitive_dep = package_name.startswith("@angular-devkit/") or package_name.startswith("@angular/build")
    filtered_deps = []

    # Note: to_list() is expensive; we need to invoke it here to get the path
    # of each transitive dependency to check if it's an angular npm package.
    for file in ctx.attr.target[DefaultInfo].default_runfiles.files.to_list():
        if not any([file.path.startswith(path) for path in problematic_paths]):
            filtered_deps.append(file)
        else:
            has_problematic_transitive_dep = True

    filtered_depset = depset(filtered_deps)

    providers = [
        DefaultInfo(files = filtered_depset),
    ]

    # Re-route all problematic direct dependency external NPM packages into `adev/node_modules`
    # without their transitive packages. This allows transitive dependency resolution to first look for
    # e.g. `@angular/core` in `adev/node_modules`, and falls back to top-level node modules.
    if has_problematic_transitive_dep and ctx.attr.target.label.workspace_name == "npm":
        providers.append(LinkablePackageInfo(
            package_name = package_name,
            package_path = "adev",
            path = "external/npm/node_modules/%s" % package_name,
            files = ctx.attr.target[ExternalNpmPackageInfo].direct_sources,
        ))
    elif LinkablePackageInfo in ctx.attr.target:
        providers.append(ctx.attr.target[LinkablePackageInfo])

    return providers

filter_external_npm_deps = rule(
    doc = "Filter out transitive angular dependencies from a target",
    implementation = _filter_external_npm_deps_impl,
    attrs = {
        "angular_packages": attr.string_list(
            mandatory = True,
            doc = "Angular packages to filter (useful for sandbox environments without linker)",
        ),
        "target": attr.label(
            mandatory = True,
            doc = "Target to filter",
            providers = [],
        ),
    },
)
