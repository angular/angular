"""
  Defaults for the `//dev-infra` Bazel package. These are different than
  the defaults in `//tools:defaults.bzl` which are specific to the package
  structure as seen within `/packages/`.
"""

load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")
load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/typescript:index.bzl", _ts_library = "ts_library")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")

NPM_PACKAGE_NAME = "@angular/dev-infra-private"

def _compute_module_name():
    current_pkg = native.package_name()

    if current_pkg == "dev-infra":
        return NPM_PACKAGE_NAME

    # For deep targets within `//dev-infra` construct the module name in a way that matches
    # the structure within the NPM package (i.e. simply appending the actual package path)
    return "%s/%s" % (NPM_PACKAGE_NAME, current_pkg[len("dev-infra/"):])

def ts_library(name, **kwargs):
    _ts_library(
        name = name,
        # If no `module_name` is set, compute a module name based on the current Bazel
        # package. The module names should match the NPM package structure so that the NPM
        # package can be used properly. Note that we disallow any custom `module_name` for
        # `//dev-infra` as this usually signifies a mistake we want to raise awareness for.
        module_name = _compute_module_name(),
        # We use the module name as package name, so that the target can be resolved within
        # NodeJS executions, by activating the Bazel NodeJS linker.
        # See: https://github.com/bazelbuild/rules_nodejs/pull/2799.
        package_name = _compute_module_name(),
        **kwargs
    )

def jasmine_node_test(**kwargs):
    _jasmine_node_test(**kwargs)

# This file continues to serve as indicator for `rules_nodejs` and instructs it to preserve the
# content output in the NPM install workspace. This allows consumers to use rules and targets from
# within Bazel. e.g. by using `@npm//@angular/dev-infra-private/<..>`.
# See: https://github.com/bazelbuild/rules_nodejs/commit/4f508b1a0be1f5444e9c13b0439e649449792fef.

def ng_dev_rolled_up_generated_file(name, entry_point, deps = [], rollup_args = []):
    """Rollup and generated file test macro.

    This provides a single macro to create a rollup bundled script and a generated file
    test for the created script to ensure it stays up to date in the repository.
    """
    rollup_bundle(
        name = "%s_bundle" % name,
        args = rollup_args,
        entry_point = entry_point,
        format = "cjs",
        silent = True,
        sourcemap = "false",
        deps = deps,
    )

    generated_file_test(
        name = name,
        src = "%s.js" % name,
        generated = "%s_bundle" % name,
    )
