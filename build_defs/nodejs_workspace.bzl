_ROOT_BUILD_FILE = """\
package(default_visibility=["//visibility:public"])

alias(
    name = "nodejs",
    actual = "//:nodejs_bin",
)
"""

def _nodejs_workspace_impl(ctx):
  """
  Workspace rule that pulls in the node binary. The binary will be available as
  //:nodejs in the workspace.

  Args:
    binary: The name of the node executable in path.
  """
  node = ctx.which(ctx.attr.binary)

  if node == None:
    fail("Node.js not found in path.")

  ctx.symlink(node, "nodejs_bin")

  # The generated alias is executable because the source file is executable.
  ctx.file("BUILD", _ROOT_BUILD_FILE, False)

nodejs_workspace = repository_rule(
    _nodejs_workspace_impl,
    attrs = {
        "binary": attr.string(default="node"),
    },
)
