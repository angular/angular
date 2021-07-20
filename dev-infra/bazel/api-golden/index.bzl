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
  Extracts type names from a list of NPM type targets.

  For example: Consider the `@npm//@types/node` target. This function extracts `node`
  from the label. This is needed so that the Node types can be wired up within a
  TypeScript program using the `types` tsconfig option.
"""

def extract_type_names_from_labels(type_targets):
    type_names = []
    for type_target in type_targets:
        type_package = Label(type_target).package

        if (type_package.startswith("@types/")):
            type_names.append(type_package[len("@types/"):])
        else:
            fail("Expected type target to match the following format: " +
                 "`@<npm_workspace>//@types/<name>`, but got: %s" % type_target)

    return type_names

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
        types = [],
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

    test_data = ["//dev-infra/bazel/api-golden", "//:package.json", ":%s_data_typings" % name] + \
                data + types

    nodejs_test(
        name = name,
        data = test_data,
        entry_point = "//dev-infra/bazel/api-golden:index.ts",
        templated_args = nodejs_test_args + [golden, entry_point, "false", quoted_export_pattern] +
                         extract_type_names_from_labels(types),
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = test_data,
        entry_point = "//dev-infra/bazel/api-golden:index.ts",
        templated_args = nodejs_test_args + [golden, entry_point, "true", quoted_export_pattern] +
                         extract_type_names_from_labels(types),
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
        types = [],
        **kwargs):
    quoted_export_pattern = _escape_regex_for_arg(strip_export_pattern)

    kwargs["tags"] = kwargs.get("tags", []) + ["api_guard"]

    nodejs_test(
        name = name,
        data = ["//dev-infra/bazel/api-golden"] + data + types,
        entry_point = "//dev-infra/bazel/api-golden:index_npm_packages.ts",
        templated_args = nodejs_test_args + [golden_dir, npm_package, "false", quoted_export_pattern] +
                         extract_type_names_from_labels(types),
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = ["//dev-infra/bazel/api-golden"] + data + types,
        entry_point = "//dev-infra/bazel/api-golden:index_npm_packages.ts",
        templated_args = nodejs_test_args + [golden_dir, npm_package, "true", quoted_export_pattern] +
                         extract_type_names_from_labels(types),
        **kwargs
    )
