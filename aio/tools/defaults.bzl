load("@build_bazel_rules_nodejs//:index.bzl", _nodejs_binary = "nodejs_binary", _nodejs_test = "nodejs_test")

def nodejs_binary(data = [], env = {}, templated_args = [], chdir = "", enable_linker = False, **kwargs):
    data = data + [
        "//aio/tools/esm-loader",
        "//aio/tools/esm-loader:esm-loader.mjs",
    ]

    env = dict(env, **{"NODE_MODULES_WORKSPACE_NAME": "aio_npm"})

    if not enable_linker:
        templated_args = templated_args + [
            # Disable the linker and rely on patched resolution which works better on Windows
            # and is less prone to race conditions when targets build concurrently.
            "--nobazel_run_linker",
        ]

    templated_args = templated_args + [
        # Provide a custom esm loader to resolve third-party depenencies. Unlike for cjs
        # modules, rules_nodejs doesn't patch imports when the linker is disabled.
        "--node_options=--loader=%s" % _esm_loader_path(chdir),
    ]

    _nodejs_binary(
        data = data,
        env = env,
        templated_args = templated_args,
        chdir = chdir,
        **kwargs
    )

def nodejs_test(data = [], env = {}, templated_args = [], chdir = "", enable_linker = False, **kwargs):
    data = data + [
        "//aio/tools/esm-loader",
        "//aio/tools/esm-loader:esm-loader.mjs",
    ]

    env = dict(env, **{"NODE_MODULES_WORKSPACE_NAME": "aio_npm"})

    if not enable_linker:
        templated_args = templated_args + [
            # Disable the linker and rely on patched resolution which works better on Windows
            # and is less prone to race conditions when targets build concurrently.
            "--nobazel_run_linker",
        ]

    templated_args = templated_args + [
        # Provide a custom esm loader to resolve third-party depenencies. Unlike for cjs
        # modules, rules_nodejs doesn't patch imports when the linker is disabled.
        "--node_options=--loader=%s" % _esm_loader_path(chdir),
    ]

    _nodejs_test(
        data = data,
        env = env,
        templated_args = templated_args,
        chdir = chdir,
        **kwargs
    )

def _esm_loader_path(chdir):
    """Adjust the path provided for the esm loader node option which
    depends on the value of chdir."""
    esm_loader_path_prefix = "./"
    if chdir and len(chdir) > 0:
        esm_loader_path_prefix = "".join(["../" for segment in chdir.split("/")])

    return "%s$(rootpath //aio/tools/esm-loader:esm-loader.mjs)" % esm_loader_path_prefix
