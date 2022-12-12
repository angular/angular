"""Macros for extending the NodeJS Bazel rules with ESM support."""

load("@build_bazel_rules_nodejs//:index.bzl", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")
load("//tools/esm-interop:esm-node-module-loader.bzl", "enable_esm_node_module_loader")
load("//tools/esm-interop:extract-esm-output.bzl", "extract_esm_outputs")

def nodejs_binary(
        name,
        data_for_args = [],
        linker_enabled = False,
        npm_workspace = "npm",
        **kwargs):
    env = kwargs.pop("env", {})
    data = kwargs.pop("data", [])
    testonly = kwargs.pop("testonly", False)
    entry_point = kwargs.pop("entry_point", None)

    # Ensure ESM entry-points are not resolved to their link target.
    templated_args = kwargs.pop("templated_args", [])
    templated_args = templated_args + ["--node_options=--preserve-symlinks-main"]

    if not linker_enabled:
        env = enable_esm_node_module_loader(npm_workspace, env)

    extract_esm_outputs(
        name = "%s_esm_deps" % name,
        testonly = testonly,
        deps = data,
    )

    _nodejs_binary(
        name = name,
        data = [":%s_esm_deps" % name] + data_for_args,
        testonly = testonly,
        entry_point = str(entry_point).replace(".js", ".mjs"),
        env = env,
        templated_args = templated_args,
        use_esm = True,
        **kwargs
    )

def nodejs_test(
        name,
        data_for_args = [],
        linker_enabled = False,
        npm_workspace = "npm",
        **kwargs):
    env = kwargs.pop("env", {})
    data = kwargs.pop("data", [])

    # Ensure ESM entry-points are not resolved to their link target.
    templated_args = kwargs.pop("templated_args", [])
    templated_args = templated_args + ["--node_options=--preserve-symlinks-main"]

    if not linker_enabled:
        env = enable_esm_node_module_loader(npm_workspace, env)

    extract_esm_outputs(
        name = "%s_esm_deps" % name,
        testonly = True,
        deps = data,
    )

    _nodejs_test(
        name = name,
        data = [":%s_esm_deps" % name] + data_for_args,
        env = env,
        templated_args = templated_args,
        use_esm = True,
        **kwargs
    )
