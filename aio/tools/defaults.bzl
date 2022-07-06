load("@build_bazel_rules_nodejs//:index.bzl", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")

def nodejs_binary(data = [], env = {}, templated_args = [], **kwargs):
    data = data + [
        "//aio/tools/esm-loader",
        "//aio/tools/esm-loader:esm-loader.mjs",
    ]

    env = dict(env, **{"NODE_MODULES_WORKSPACE_NAME": "aio_npm"})

    templated_args = templated_args + [
        # Disable the linker and rely on patched resolution which works better on Windows
        # and is less prone to race conditions when targets build concurrently.
        "--nobazel_run_linker",
        # Provide a custom esm loader to resolve third-party depenencies. Unlike for cjs
        # modules, rules_nodejs doesn't patch imports when the linker is disabled.
        "--node_options=--loader=./$(rootpath //aio/tools/esm-loader:esm-loader.mjs)",
    ]

    _nodejs_binary(
        data = data,
        env = env,
        templated_args = templated_args,
        **kwargs
    )

def nodejs_test(data = [], env = {}, templated_args = [], **kwargs):
    data = data + [
        "//aio/tools/esm-loader",
        "//aio/tools/esm-loader:esm-loader.mjs",
    ]

    env = dict(env, **{"NODE_MODULES_WORKSPACE_NAME": "aio_npm"})

    templated_args = templated_args + [
        # Disable the linker and rely on patched resolution which works better on Windows
        # and is less prone to race conditions when targets build concurrently.
        "--nobazel_run_linker",
        # Provide a custom esm loader to resolve third-party depenencies. Unlike for cjs
        # modules, rules_nodejs doesn't patch imports when the linker is disabled.
        "--node_options=--loader=./$(rootpath //aio/tools/esm-loader:esm-loader.mjs)",
    ]

    _nodejs_test(
        data = data,
        env = env,
        templated_args = templated_args,
        **kwargs
    )
