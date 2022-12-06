"""ESM loader helpers."""

def install_esm_loaders(
        templated_args,
        data):
    """Installs a NodeJS import loader for ESM support. Individual loades may \
      be controlled via environment variables.

    Args:
      templated_args: Existing list of arguments passed to the binary/test.
      data: Existing runtime dependencies for the binary/test.

    Returns:
      A ruple with the updated `templated_args` and `data`.
    """

    templated_args = templated_args + [
        "--node_options=--experimental-loader=file:///$$(rlocation $(rootpath //tools/esm-interop:esm-main-loader.mjs))",
        "--node_options=--no-warnings",  # `--loader` is an experimental feature with warnings.
    ]
    data = data + [
        "//tools/esm-interop:esm-main-loader.mjs",
        "//tools/esm-interop:loaders",
    ]

    return (templated_args, data)
