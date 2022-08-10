load("//:packages.bzl", "ALL_PACKAGES", "to_package_label")
load("@build_bazel_rules_nodejs//internal/linker:npm_link.bzl", "npm_link")

def link_local_packages(deps):
    """Stamp npm_link targets for packages in deps that has a local package equivalent.

    Args:
        deps: list of npm dependency labels
    """
    for dep in deps:
        label = Label(dep)
        if label.package in ALL_PACKAGES:
            npm_link(
                name = _npm_link_name(dep),
                target = to_package_label(label.package),
                package_name = label.package,
                package_path = native.package_name(),
                tags = ["manual"],
            )

def substitute_local_packages(deps):
    """Substitute npm dependencies for their local npm_link equivalent.

    Assumes that link_local_packages() was already called on these dependencies.
    Dependencies that are not associated with a local package are left alone.

    Args:
        deps: list of npm dependency labels

    Returns:
        substituted list of dependencies
    """
    substituted = []
    for dep in deps:
        label = Label(dep)
        if label.package in ALL_PACKAGES:
            substituted.append(_npm_link_name(dep))
        else:
            substituted.append(dep)
    return substituted

def _npm_link_name(dep):
    label = Label(dep)
    return "local_%s" % label.package.replace("@", "_").replace("/", "_")
