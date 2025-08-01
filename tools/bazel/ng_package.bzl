load("@rules_angular//src/ng_package:index.bzl", _ng_package = "ng_package")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

# Packages which are versioned together on npm
ANGULAR_SCOPED_PACKAGES = ["@angular/%s" % p for p in [
    # core should be the first package because it's the main package in the group
    # this is significant for Angular CLI and "ng update" specifically, @angular/core
    # is considered the identifier of the group by these tools.
    "core",
    "bazel",
    "common",
    "compiler",
    "compiler-cli",
    "animations",
    "elements",
    "platform-browser",
    "platform-browser-dynamic",
    "forms",
    "platform-server",
    "upgrade",
    "router",
    "language-service",
    "localize",
    "service-worker",
]]

PKG_GROUP_REPLACEMENTS = {
    "\"NG_UPDATE_PACKAGE_GROUP\"": """[
      %s
    ]""" % ",\n      ".join(["\"%s\"" % s for s in ANGULAR_SCOPED_PACKAGES]),
}

def ng_package(name, readme_md = None, license_banner = None, license = None, deps = [], **kwargs):
    if not readme_md:
        readme_md = "//packages:README.md"
    if not license_banner:
        license_banner = "//packages:license-banner.txt"
    if not license:
        license = "//:LICENSE"
    visibility = kwargs.pop("visibility", None)
    tags = kwargs.pop("tags", [])

    common_substitutions = dict(kwargs.pop("substitutions", {}), **PKG_GROUP_REPLACEMENTS)
    substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "0.0.0",
    })
    stamped_substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "{{STABLE_PROJECT_VERSION}}",
    })

    rollup_runtime_deps = [
        "//:node_modules/@rollup/plugin-commonjs",
        "//:node_modules/@rollup/plugin-node-resolve",
        "//:node_modules/magic-string",
        "//:node_modules/rollup-plugin-dts",
        "//:node_modules/rollup-plugin-sourcemaps2",
    ]

    _ng_package(
        name = name,
        deps = deps,
        readme_md = readme_md,
        license = license,
        rollup_runtime_deps = rollup_runtime_deps,
        license_banner = license_banner,
        substitutions = select({
            "//:stamp": stamped_substitutions,
            "//conditions:default": substitutions,
        }),
        visibility = visibility,
        tags = tags,
        **kwargs
    )

    _ng_package(
        name = "%s_nosub" % name,
        deps = deps,
        readme_md = readme_md,
        license = license,
        rollup_runtime_deps = rollup_runtime_deps,
        license_banner = license_banner,
        substitutions = common_substitutions,
        visibility = visibility,
        tags = ["manual"],
        **kwargs
    )

    pkg_tar(
        name = name + "_archive",
        srcs = [":%s" % name],
        extension = "tar.gz",
        strip_prefix = "./%s" % name,
        # should not be built unless it is a dependency of another rule
        tags = ["manual"],
        visibility = visibility,
    )
