"""Re-export of some bazel rules with repository-wide defaults."""

load("@build_bazel_rules_nodejs//:index.bzl", _pkg_npm = "pkg_npm")
load("@devinfra//bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@devinfra//bazel:extract_types.bzl", _extract_types = "extract_types")
load("@rules_pkg//:pkg.bzl", "pkg_tar")

extract_types = _extract_types

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
    # Current plan for Angular v8 is to not include @angular/http in ng update
    # "http",
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

def pkg_npm(name, deps = [], validate = True, **kwargs):
    """Default values for pkg_npm"""
    visibility = kwargs.pop("visibility", None)

    common_substitutions = dict(kwargs.pop("substitutions", {}), **PKG_GROUP_REPLACEMENTS)
    substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "0.0.0",
    })
    stamped_substitutions = dict(common_substitutions, **{
        "0.0.0-PLACEHOLDER": "{STABLE_PROJECT_VERSION}",
    })

    # NOTE: We keep this to avoid the linker mappings from `deps` to be forwarded.
    # e.g. the `pkg_npm` might have a `package_name` but the source `ts_library` too.
    # This is a bug in `rules_nodejs` that should be fixed.
    # TODO(devversion): Remove this when we landed a fix in `rules_nodejs`.
    # Related to: https://github.com/bazelbuild/rules_nodejs/issues/2941.
    extract_js_module_output(
        name = "%s_js_module_output" % name,
        provider = "JSModuleInfo",
        include_declarations = True,
        include_default_files = True,
        forward_linker_mappings = False,
        include_external_npm_packages = False,
        deps = deps,
    )

    _pkg_npm(
        name = name,
        validate = validate,
        substitutions = select({
            "//:stamp": stamped_substitutions,
            "//conditions:default": substitutions,
        }),
        deps = [":%s_js_module_output" % name],
        visibility = visibility,
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
