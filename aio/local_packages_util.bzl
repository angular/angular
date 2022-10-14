load("//:packages.bzl", "ALL_PACKAGES", "to_package_label")
load("@build_bazel_rules_nodejs//internal/linker:npm_link.bzl", "npm_link")
load("@build_bazel_rules_nodejs//:providers.bzl", "LinkablePackageInfo")
load("@build_bazel_rules_nodejs//internal/linker:link_node_modules.bzl", "LinkerPackageMappingInfo")

def _is_angular_dep(dep):
    """Check if a dep , e.g., @aio_npm//@angular/core corresonds to a local Angular pacakge."""
    return dep.startswith("@aio_npm//") and _angular_dep_to_pkg_name(dep) in ALL_PACKAGES

def _angular_dep_to_pkg_name(dep):
    """E.g., @aio_npm//@angular/core => '@angular/core'"""
    label = Label(dep)
    return label.package

def link_local_packages(all_aio_deps):
    """Create targets needed for building AIO against local angular packages.

    Creates targets that link Angular packages, as well as targets to be used
    in place of any deps required to build and test AIO. These targets filter
    out any transitive deps on the npm packages and must be used in place of
    any original list of deps.

    Use the helper `substitute_local_package_deps()` to translate a list of deps
    to the equivalent "filtered" target that this rule creates.

    Args:
        all_aio_deps: label list of all deps required to build and test AIO
    """

    aio_angular_deps = [dep for dep in all_aio_deps if _is_angular_dep(dep)]
    angular_packages = [_angular_dep_to_pkg_name(dep) for dep in aio_angular_deps]

    # Link local angular packages in place of their npm equivalent
    for dep in aio_angular_deps:
        pkg_name = _angular_dep_to_pkg_name(dep)
        npm_link(
            name = _npm_link_name(pkg_name),
            target = to_package_label(pkg_name),
            package_name = pkg_name,
            package_path = native.package_name(),
            tags = ["manual"],
        )

    # Special case deps that must be testonly
    testonly_deps = [
        "@aio_npm//@angular/build-tooling/bazel/browsers/chromium",
    ]

    # Stamp a corresponding target for each AIO dep that filters out transitive
    # dependencies on angular npm packages. This help the rules_nodejs linker,
    # which fails to link local packages a transitive dependency on the npm
    # package exists.
    for dep in all_aio_deps:
        target = dep
        if dep in aio_angular_deps:
            pkg_name = _angular_dep_to_pkg_name(dep)

            # We don't need to filter transitives on local packages as they depend
            # on each other locally.
            native.alias(
                name = _filtered_transitives_name(dep),
                actual = ":%s" % _npm_link_name(pkg_name),
                tags = ["manual"],
            )
        else:
            filter_transitive_angular_deps(
                name = _filtered_transitives_name(dep),
                target = target,
                angular_packages = angular_packages,
                testonly = True if dep in testonly_deps else False,
                tags = ["manual"],
            )

def substitute_local_package_deps(deps):
    """Substitute AIO dependencies with an equivalent target that filters
    out any transitive npm dependencies. You should call link_local_packages()
    to actually stamp the targets first.

    Args:
        deps: list of AIO dependencies

    Returns:
        substituted list of dependencies
    """

    return [":%s" % _filtered_transitives_name(dep) for dep in deps]

def _npm_link_name(pkg_name):
    return "local_%s" % pkg_name.replace("@", "_").replace("/", "_")

def _filtered_transitives_name(dep):
    if dep.startswith(":"):
        return "%s_filtered" % dep[1:]
    else:
        label = Label(dep)
        return "%s_filtered" % label.package.replace("@", "_").replace("/", "_")

def _filter_transitive_angular_deps_impl(ctx):
    paths = ["external/aio_npm/node_modules/%s" % pkg for pkg in ctx.attr.angular_packages]

    filtered_deps = []

    # Note: to_list() is expensive; we need to invoke it here to get the path
    # of each transitive dependency to check if it's an angular npm package.
    for file in ctx.attr.target[DefaultInfo].default_runfiles.files.to_list():
        if not any([file.path.startswith(path) for path in paths]):
            filtered_deps.append(file)

    filtered_depset = depset(filtered_deps)
    providers = [
        DefaultInfo(
            files = filtered_depset,
        ),
    ]

    if LinkerPackageMappingInfo in ctx.attr.target:
        providers.append(ctx.attr.target[LinkerPackageMappingInfo])
    if LinkablePackageInfo in ctx.attr.target:
        providers.append(ctx.attr.target[LinkablePackageInfo])

    return providers

filter_transitive_angular_deps = rule(
    doc = "Filter out transitive angular dependencies from a target",
    implementation = _filter_transitive_angular_deps_impl,
    attrs = {
        "target": attr.label(mandatory = True, doc = "Target to filter"),
        "angular_packages": attr.string_list(default = [], doc = "Angular packages to filter"),
    },
)
