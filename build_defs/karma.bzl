_KARMA_TEST_ATTRS = {
    "srcs": attr.label_list(allow_files=True),
    "deps": attr.label_list(),
    "data": attr.label_list(allow_files=True, cfg=DATA_CFG),
    "config": attr.label(allow_files=True, single_file=True, mandatory=True),

    "_karma": attr.label(default=Label("//:karma_bin"), executable=True),
    "_launcher_template": attr.label(
        default = Label("//build_defs:karma_launcher_template.sh"),
        allow_files = True,
        single_file = True,
    ),
}

def _karma_test_impl(ctx, karma_args="--single-run"):
  """
  Rule for running Karma tests.

  Args:
    srcs: The targets containing the spec files.
    deps: JavaScript targets which the tests depend on.
    data: Data files which the tests depend on.
    config: Required. Karma config file to use.

  Due to the complexity of Karma config files, this rule does not do the heavy
  lifting of creating that config file. Instead, the user has to point to the
  right files. Files specified in Karma must be a subset of files depended upon
  in the karma_test definition.

  This rule additionally creates a <name>_local target, which runs Karma in
  watch mode. This can be combined with ibazel for incremental development.
  """
  ctx.template_action(
      template = ctx.file._launcher_template,
      output = ctx.outputs.executable,
      substitutions = {
          "{{karma}}": ctx.executable._karma.short_path,
          "{{config}}": ctx.file.config.short_path,
          "{{args}}": karma_args,
      },
      executable = True,
  )

  return struct(
      files = set([ctx.outputs.executable]),
      runfiles = ctx.runfiles(
          files = ctx.files.srcs + ctx.files._karma + ctx.files.config,
          transitive_files = set(ctx.attr._karma.default_runfiles.files),
          collect_data = True,
          collect_default = True,
      ),
  )

_karma_test = rule(
    implementation = _karma_test_impl,
    executable = True,
    test = True,
    attrs = _KARMA_TEST_ATTRS,
)

def _karma_test_local_impl(ctx):
  return _karma_test_impl(ctx, karma_args = "")

_karma_test_local = rule(
    implementation = _karma_test_local_impl,
    executable = True,
    attrs = _KARMA_TEST_ATTRS,
)

def karma_test(*, name, timeout=None, size=None, flaky=None, shard_count=None, local=None,
               tags=None, **kwargs):
  tags = tags or []
  _karma_test(name=name, timeout=timeout, size=size, flaky=flaky, shard_count=shard_count,
              local=local, tags=tags, **kwargs)
  _karma_test_local(name=name + "_local", tags=tags + ["ibazel_notify_changes"], **kwargs)
