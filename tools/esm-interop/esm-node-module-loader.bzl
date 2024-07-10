"""ESM node module loader helpers."""

def enable_esm_node_module_loader(
        node_modules_workspace,
        env):
    """Enables a NodeJS import loader that ensures modules can be resolved from the Bazel repository.

    Args:
      node_modules_workspace: Name of the workspace in which node modules are available.
      env: Struct of environment variables passed to a binary/test.

    Returns:
      The updated `env` dictionary.
    """

    env = dict(
        env,
        NODE_MODULES_WORKSPACE_NAME = node_modules_workspace,
        ESM_NODE_MODULE_LOADER_ENABLED = "true",
    )

    return env
