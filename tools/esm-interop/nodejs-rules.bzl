"""Macros for extending the NodeJS Bazel rules with ESM support."""

load("@build_bazel_rules_nodejs//:index.bzl", _nodejs_binary = "nodejs_binary")
load("//tools/esm-interop:esm-node-module-loader.bzl", "enable_esm_node_module_loader")

def nodejs_binary(
        name,
        linker_enabled = False,
        npm_workspace = "npm",
        **kwargs):
    env = kwargs.pop("env", {})
    testonly = kwargs.pop("testonly", False)
    entry_point = kwargs.pop("entry_point", None)

    # Ensure ESM entry-points are not resolved to their link target.
    templated_args = kwargs.pop("templated_args", [])
    templated_args = templated_args + ["--node_options=--preserve-symlinks-main"]

    if not linker_enabled:
        env = enable_esm_node_module_loader(npm_workspace, env)

    _nodejs_binary(
        name = name,
        testonly = testonly,
        entry_point = entry_point,
        env = env,
        templated_args = templated_args,
        use_esm = True,
        **kwargs
    )
