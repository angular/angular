load("@build_bazel_rules_nodejs//internal/linker:npm_link.bzl", "npm_link")
load("//:packages.bzl", "ALL_PACKAGES", "to_package_label")
load("//adev/tools/local_deps:filter_external_npm_deps.bzl", "filter_external_npm_deps")

def ensure_local_package_deps(deps):
    """Replaces dependencies with their local-linked variants."""
    return [":%s" % _filtered_transitives_name(dep) for dep in deps]

def link_local_packages(all_deps):
    """Create targets needed for building adev against local angular packages.

    Creates targets that link Angular packages, as well as targets to be used
    in place of any deps required to build and test adev. These targets filter
    out any transitive deps on the npm packages and must be used in place of
    any original list of deps.

    Use the helper `ensure_local_package_deps()` to translate a list of deps
    to the equivalent "filtered" target that this rule creates.

    Args:
        all_deps: label list of all deps required to build and test adev
    """

    local_angular_deps = [dep for dep in all_deps if _is_angular_dep(dep)]
    local_angular_package_names = [_angular_dep_to_pkg_name(dep) for dep in local_angular_deps]

    # Link local angular packages in place of their npm equivalent
    for dep in local_angular_deps:
        pkg_name = _angular_dep_to_pkg_name(dep)
        npm_link(
            name = _npm_link_name(pkg_name),
            target = to_package_label(pkg_name) + "__adev_link",
            package_name = pkg_name,
            package_path = native.package_name(),
            tags = ["manual"],
        )

    # Special case deps that must be testonly
    testonly_deps = [
        "@npm//@angular/build-tooling/bazel/browsers/chromium",
    ]

    # Stamp a corresponding target for each dep that filters out transitive
    # dependencies on external npm packages. This help the rules_nodejs linker,
    # which fails to link local packages into transitive dependencies of npm deps.
    for dep in all_deps:
        target = dep
        if dep in local_angular_deps:
            pkg_name = _angular_dep_to_pkg_name(dep)
            target = ":%s" % _npm_link_name(pkg_name)

        filter_external_npm_deps(
            name = _filtered_transitives_name(dep),
            target = target,
            testonly = True if dep in testonly_deps else False,
            angular_packages = local_angular_package_names,
            tags = ["manual"],
        )

def _is_angular_dep(dep):
    """Check if a dep , e.g., @npm//@angular/core corresonds to a local Angular pacakge."""
    return dep.startswith("@npm//") and (_angular_dep_to_pkg_name(dep) in ALL_PACKAGES)

def _angular_dep_to_pkg_name(dep):
    """E.g., @npm//@angular/core => '@angular/core'"""
    label = Label(dep)
    return label.package

def _npm_link_name(pkg_name):
    return "local_head_%s" % pkg_name.replace("@", "_").replace("/", "_")

def _filtered_transitives_name(dep):
    if dep.startswith(":"):
        return "%s_without_transitive_deps" % dep[1:]
    else:
        label = Label(dep)
        return "%s_without_transitive_deps" % label.package.replace("@", "_").replace("/", "_")
