load("//build_defs:utils.bzl", "pick_file")


def _public_api_impl(ctx):
  """
  Rule for generating golden files with ts-api-guardian.

  Args:
    srcs: The ts_library targets containing the ts files.
    entry_points: The paths for entrypoint files.
  """
  entry_points = []
  declaration_files = []

  for src in ctx.attr.srcs:
    declaration_files += src.typescript.declarations

  entry_points = [pick_file(declaration_files, ctx.label, ep) for ep in ctx.attr.entry_points]

  ctx.template_action(
      template = ctx.file._launcher_template,
      output = ctx.outputs.executable,
      substitutions = {
          "{{ts_api_guardian}}": ctx.executable._ts_api_guardian.short_path,
          "{{mode}}": "out",
          "{{root_dir}}": ctx.attr.root_dir,
          "{{golden_dir}}": ctx.attr.out_dir,
          "{{arguments}}": " ".join(ctx.attr.arguments),
          "{{entry_points}}": " ".join([f.short_path for f in entry_points]),
      },
      executable = True,
  )

  return struct(
      files = set([ctx.outputs.executable]),
      runfiles = ctx.runfiles(
          files = declaration_files + ctx.files._ts_api_guardian,
          transitive_files = set(ctx.attr._ts_api_guardian.default_runfiles.files),
      ),
      public_api = struct(
          srcs = declaration_files,
          root_dir = ctx.attr.root_dir,
          golden_dir = ctx.attr.out_dir,
          arguments = " ".join(ctx.attr.arguments),
          entry_points = entry_points,
      ),
  )

public_api = rule(
    implementation = _public_api_impl,
    executable = True,
    attrs = {
        "srcs": attr.label_list(allow_files=True),
        "entry_points": attr.string_list(mandatory=True),
        "root_dir": attr.string(default="."),
        "out_dir": attr.string(mandatory=True),
        "arguments": attr.string_list(),

        "_ts_api_guardian": attr.label(default=Label("//:ts-api-guardian_bin"), executable=True),
        "_launcher_template": attr.label(
            default = Label("//build_defs:ts_api_guardian_launcher_template.sh"),
            allow_files = True,
            single_file = True,
        ),
    },
)


def _public_api_test_impl(ctx):
  """
  Rule for running ts-api-guardian test.

  Args:
    public_api: The corresponding public_api target.
  """
  public_api = ctx.attr.public_api.public_api
  ctx.template_action(
      template = ctx.file._launcher_template,
      output = ctx.outputs.executable,
      substitutions = {
          "{{ts_api_guardian}}": ctx.executable._ts_api_guardian.short_path,
          "{{mode}}": "verify",
          "{{root_dir}}": public_api.root_dir,
          "{{golden_dir}}": public_api.golden_dir,
          "{{arguments}}": public_api.arguments,
          "{{entry_points}}": " ".join([f.short_path for f in public_api.entry_points]),
      },
      executable = True,
  )

  return struct(
      files = set([ctx.outputs.executable]),
      runfiles = ctx.runfiles(
          files = ctx.files.srcs + public_api.srcs + ctx.files._ts_api_guardian + ctx.files.public_api,
          transitive_files = set(ctx.attr._ts_api_guardian.default_runfiles.files),
      ),
  )

public_api_test = rule(
    implementation = _public_api_test_impl,
    executable = True,
    test = True,
    attrs = {
        "srcs": attr.label_list(allow_files=True),
        "public_api": attr.label(providers=["public_api"], mandatory=True),

        "_ts_api_guardian": attr.label(default=Label("//:ts-api-guardian_bin"), executable=True),
        "_launcher_template": attr.label(
            default = Label("//build_defs:ts_api_guardian_launcher_template.sh"),
            allow_files = True,
            single_file = True,
        ),
    },
)
