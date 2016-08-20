def _protractor_test_impl(ctx):
  """
  Rule for running Protractor tests.

  Args:
    srcs: The targets containing the spec files.
    deps: JavaScript targets which the tests depend on.
    data: Data files which the tests depend on. This should include all client-
      side files required for the tests.
    config: Required. Protractor config file to use.

  When this rule is run, the runfiles tree will be served at port 8000, rooted
  at the workspace. Protractor tests can make use of this server. Additionally,
  you can pass in the argument --serve-only to only run the server, e.g.:

    $ bazel run :foo_e2e_test -- --serve-only
  """
  ctx.template_action(
      template = ctx.file._launcher_template,
      output = ctx.outputs.executable,
      substitutions = {
          "{{protractor}}": ctx.executable._protractor.short_path,
          "{{config}}": ctx.file.config.short_path,
          "{{serve_runfiles}}": ctx.executable._serve_runfiles.short_path,
      },
      executable = True,
  )

  return struct(
      files = set([ctx.outputs.executable]),
      runfiles = ctx.runfiles(
          files = ctx.files.srcs + ctx.files._protractor + ctx.files._serve_runfiles + ctx.files.config,
          transitive_files = set(ctx.attr._protractor.default_runfiles.files) + set(ctx.attr._serve_runfiles.default_runfiles.files),
          collect_data = True,
          collect_default = True,
      ),
  )

_protractor_test = rule(
    implementation = _protractor_test_impl,
    executable = True,
    test = True,
    attrs = {
        "srcs": attr.label_list(allow_files=True),
        "deps": attr.label_list(),
        "data": attr.label_list(allow_files=True, cfg=DATA_CFG),
        "config": attr.label(allow_files=True, single_file=True, mandatory=True),

        "_protractor": attr.label(default=Label("//:protractor_bin"), executable=True),
        "_serve_runfiles": attr.label(
            default = Label("//build_defs/tools:serve_runfiles"),
            executable = True,
        ),
        "_launcher_template": attr.label(
            default = Label("//build_defs:protractor_launcher_template.sh"),
            allow_files = True,
            single_file = True,
        ),
    },
)

def protractor_test(*, tags=None, **kwargs):
  tags = tags or []
  _protractor_test(tags=tags + ["ibazel_notify_changes"], **kwargs)
