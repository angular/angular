load("//dev-infra/bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")

nodejs_test_args = [
    # Needed so that node doesn't walk back to the source directory.
    # From there, the relative imports would point to .ts files.
    "--node_options=--preserve-symlinks",
    # TODO(josephperrott): update dependency usages to no longer need bazel patch module resolver
    # See: https://github.com/bazelbuild/rules_nodejs/wiki#--bazel_patch_module_resolver-now-defaults-to-false-2324
    "--bazel_patch_module_resolver",
]

default_strip_export_pattern = "^ɵ(?!ɵdefineInjectable|ɵinject|ɵInjectableDef)"

"""Escapes a Regular expression so that it can be passed as process argument."""

def _escape_regex_for_arg(value):
    return "\"%s\"" % value

"""
  Builds an API report for the specified entry-point and compares it against the
  specified golden
"""

def api_golden_test(
        name,
        golden,
        entry_point,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        **kwargs):
    quoted_export_pattern = _escape_regex_for_arg(strip_export_pattern)

    kwargs["tags"] = kwargs.get("tags", []) + ["api_guard"]

    # For API golden tests not running against a NPM package, we extract all transitive
    # declarations of the specified `data` targets. This is necessary because API extractor
    # needs to resolve other targets that have been linked by the Bazel NodeJS rules. The
    # linker by default only provides access to JavaScript sources, but the API extractor is
    # specifically concerned with type definitions that we can extract manually here.
    extract_js_module_output(
        name = "%s_data_typings" % name,
        deps = data,
        provider = "JSModuleInfo",
        include_declarations = True,
        include_default_files = False,
    )

    test_data = ["//dev-infra/bazel/api-golden", "//:package.json", ":%s_data_typings" % name] + data

    nodejs_test(
        name = name,
        data = test_data,
        entry_point = "//dev-infra/bazel/api-golden:index.ts",
        templated_args = nodejs_test_args + [golden, entry_point, "false", quoted_export_pattern],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = test_data,
        entry_point = "//dev-infra/bazel/api-golden:index.ts",
        templated_args = nodejs_test_args + [golden, entry_point, "true", quoted_export_pattern],
        **kwargs
    )

"""
  Builds an API report for all entrypoints within the given NPM package and compares it
  against goldens within the specified directory.
"""

def api_golden_test_npm_package(
        name,
        golden_dir,
        npm_package,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        **kwargs):
    quoted_export_pattern = _escape_regex_for_arg(strip_export_pattern)

    kwargs["tags"] = kwargs.get("tags", []) + ["api_guard"]

    nodejs_test(
        name = name,
        data = ["//dev-infra/bazel/api-golden"] + data,
        entry_point = "//dev-infra/bazel/api-golden:index_npm_packages.ts",
        templated_args = nodejs_test_args + [golden_dir, npm_package, "false", quoted_export_pattern],
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = ["//dev-infra/bazel/api-golden"] + data,
        entry_point = "//dev-infra/bazel/api-golden:index_npm_packages.ts",
        templated_args = nodejs_test_args + [golden_dir, npm_package, "true", quoted_export_pattern],
        **kwargs
    )
