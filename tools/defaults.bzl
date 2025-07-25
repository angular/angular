"""Re-export of some bazel rules with repository-wide defaults."""

load("@build_bazel_rules_nodejs//:index.bzl", _npm_package_bin = "npm_package_bin", _pkg_npm = "pkg_npm")
load("@devinfra//bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@devinfra//bazel:extract_types.bzl", _extract_types = "extract_types")
load("@devinfra//bazel/http-server:index.bzl", _http_server = "http_server")
load("@rules_pkg//:pkg.bzl", "pkg_tar")
load("//adev/shared-docs/pipeline/api-gen:generate_api_docs.bzl", _generate_api_docs = "generate_api_docs")
load("//tools/esm-interop:index.bzl", _nodejs_binary = "nodejs_binary")

http_server = _http_server
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

def nodejs_binary(
        name,
        templated_args = [],
        enable_linker = False,
        **kwargs):
    npm_workspace = _node_modules_workspace_name()

    if not enable_linker:
        templated_args = templated_args + [
            # Disable the linker and rely on patched resolution which works better on Windows
            # and is less prone to race conditions when targets build concurrently.
            "--nobazel_run_linker",
        ]

    _nodejs_binary(
        name = name,
        npm_workspace = npm_workspace,
        linker_enabled = enable_linker,
        templated_args = templated_args,
        **kwargs
    )

def _node_modules_workspace_name():
    return "npm"

def npm_package_bin(args = [], **kwargs):
    _npm_package_bin(
        # Disable the linker and rely on patched resolution which works better on Windows
        # and is less prone to race conditions when targets build concurrently.
        args = ["--nobazel_run_linker"] + args,
        **kwargs
    )

def generate_api_docs(**kwargs):
    _generate_api_docs(
        # We need to specify import mappings for Angular packages that import other Angular
        # packages.
        import_map = {
            # We only need to specify top-level entry-points, and only those that
            # are imported from other packages.
            "//packages/animations:index.ts": "@angular/animations",
            "//packages/common:index.ts": "@angular/common",
            "//packages/core:index.ts": "@angular/core",
            "//packages/forms:index.ts": "@angular/forms",
            "//packages/localize:index.ts": "@angular/localize",
            "//packages/platform-browser-dynamic:index.ts": "@angular/platform-browser-dynamic",
            "//packages/platform-browser:index.ts": "@angular/platform-browser",
            "//packages/platform-server:index.ts": "@angular/platform-server",
            "//packages/router:index.ts": "@angular/router",
            "//packages/upgrade:index.ts": "@angular/upgrade",
        },
        **kwargs
    )
