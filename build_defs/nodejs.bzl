load("//build_defs:utils.bzl", "join_paths", "pick_file_in_dir")


_NODEJS_MODULE_ATTRS = {
    "srcs": attr.label_list(allow_files=True, mandatory=True, cfg=DATA_CFG),
    "deps": attr.label_list(providers=["nodejs"], cfg=DATA_CFG),
    "data": attr.label_list(allow_files=True, cfg=DATA_CFG),
}
_NODEJS_EXECUTABLE_ATTRS =  _NODEJS_MODULE_ATTRS + {
    "entry_point": attr.string(mandatory=True),
    "_nodejs": attr.label(
        default = Label("@nodejs//:nodejs"),
        allow_files = True,
        executable = True,
    ),
    "_launcher_template": attr.label(
        default = Label("//build_defs:nodejs_launcher_template.sh"),
        allow_files = True,
        single_file = True,
    ),
}

def _nodejs_module_impl(ctx):
  """nodejs_module

  Rule for defining a Node.js module.

  Args:
    srcs: Required. A list of source files that make up the module. The general
      assumption is that this should be CommonJS files that can run directly on
      Node.js.
    deps: A list of Node.js modules that this module depends on.

  Unfortunately, since we do not patch require() currently, the Node.js rules
  cannot do anything to ensure that modules are resolved at runtime.

  The Node.js wrapper, however, provides these command line arguments:
    --node_options=--foo_option=bar
      Passes --foo_option=bar to Node.js as startup options.
    --node_path=path/to/foo:path/to/bar
      Adds the specified paths to NODE_PATH after resolving them relative to
      runfiles.

  You can use them with the "args" kwarg in any Node.js-based target. A
  convenient option is --node_options=debug, which launches the target in a
  debugger. Note that however, you have to use `bazel-run.sh` to do that in
  order to connect stdin.

  Note that Node.js resolves symlinks when loading modules, which is wrong in
  our bazel environment, since it resolves symlinks that may cross the runfiles
  boundary. We may be able to use the Node.js flag "--preserve-symlinks"
  introduced in Node.js 6.2. See https://github.com/nodejs/node/pull/6537
  """
  return struct(
      files = set(ctx.files.srcs),
      runfiles = ctx.runfiles(
          files = ctx.files.srcs,
          collect_data = True,
          collect_default = True,
      ),
      nodejs = struct(),
      javascript = struct(
          files = ctx.files.srcs,
      ),
  )

nodejs_module = rule(
    implementation = _nodejs_module_impl,
    attrs = _NODEJS_MODULE_ATTRS,
)


def _nodejs_binary_impl(ctx):
  """nodejs_binary

  Rule for defining a Node.js binary. This creates an executable version of
  a Node.js module.

  Args:
    srcs: Required. A list of source files that make up the module.
    deps: A list of Node.js modules that this module depends on.
    data: A list of extra files or targets to include in runfiles.
    entry_point: The main JavaScript file to run. This is resolved relative to
      the package of the first "srcs" target.
  """
  main_src = ctx.attr.srcs[0]
  entry_point_file, entry_point_relative_path = pick_file_in_dir(
      main_src.files, main_src.label, ctx.attr.entry_point)

  ctx.template_action(
      template = ctx.file._launcher_template,
      output = ctx.outputs.executable,
      substitutions = {
          "{{nodejs}}": ctx.executable._nodejs.short_path,
          "{{entry_point}}": join_paths(entry_point_file.short_path, entry_point_relative_path),
      },
      executable = True,
  )

  return struct(
      files = set([ctx.outputs.executable]),
      runfiles = ctx.runfiles(
          files = ctx.files.srcs + ctx.files._nodejs,
          collect_data = True,
          collect_default = True,
      ),
      nodejs = struct(),
      javascript = struct(
          files = ctx.files.srcs,
      ),
  )

nodejs_binary = rule(
    implementation = _nodejs_binary_impl,
    executable = True,
    attrs = _NODEJS_EXECUTABLE_ATTRS,
)


"""nodejs_test

A variant of nodejs_binary with "test=True".
"""
nodejs_test = rule(
    implementation = _nodejs_binary_impl,
    test = True,
    attrs = _NODEJS_EXECUTABLE_ATTRS,
)
