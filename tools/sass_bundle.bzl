load("@io_bazel_rules_sass//:defs.bzl", "SassInfo")

# Implementation of sass_bundle that performs an action
def _sass_bundle(ctx):
  # Define arguments that will be passed to the underlying nodejs script.
  args = ctx.actions.args()

  # The entry-point scss file for the bundle.
  args.add("--entry")
  args.add(ctx.attr.entry_point.files)

  # The list of files that can be included in the bundle.
  args.add("--srcs")
  args.add(ctx.files.srcs, join_with =",")

  # The generated bundle's filename.
  args.add("--output")
  args.add(ctx.outputs.output_name.path)

  # Define an "action" that will run the nodejs_binary executable. This is
  # the main thing that sass_bundle rule does.
  ctx.actions.run(
    inputs = ctx.files.srcs + ctx.files.entry_point,
    executable = ctx.executable._sass_bundle,
    outputs = [ctx.outputs.output_name],
    arguments = [args],
    progress_message = "SassBundle (%s)" % ctx.attr.output_name,
  )

  output_depset = depset([ctx.outputs.output_name])

  # The return value describes what the rule is producing. In this case we need to specify
  # the "DefaultInfo" and "SassInfo" provider so that the given rule target acts like a filegroup
  # and can be also used as sass_library.
  return [
    DefaultInfo(files = output_depset),
    SassInfo(transitive_sources = output_depset),
  ]

# Rule definition for sass_bundle that defines attributes and outputs.
sass_bundle = rule(
  # Point to the function that will execute for this rule.
  implementation = _sass_bundle,

  # The attributes that can be set to this rule.
  attrs = {
    # The source files for this rule. This must include all sass files that
    # *could* be included in the bundle, as only the files that this rule knows
    # about (i.e. the labels) will be available in the bazel sandbox in which
    # the nodejs_binary runs.
    "srcs": attr.label_list(allow_files = True),

    # The name of the file to be output from this rule. The rule will fail if
    # the nodejs_binary does not produce this output file. By using
    # `attr.output()`, we can omit the separate `outputs` declaration a more
    # complicated rule would need.
    "output_name": attr.output(),

    # The scss entry-point. Note that this uses a label and not a string
    # in order to make bazel aware that this file is a *dependency* of the
    # rule (and will thus be available to the nodejs_binary in the sandbox).
    "entry_point": attr.label(mandatory = True, allow_single_file = True),

    # The executable (bundler) for this rule (private).
    "_sass_bundle": attr.label(
      default = Label("//tools:sass_bundle"),
      executable = True,
      cfg = "host"
  )},
)
