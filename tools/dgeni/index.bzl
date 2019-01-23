"""
  Implementation of the "_dgeni_api_docs" rule. The implementation runs Dgeni with the
  specified entry points and outputs the API docs into a package relative directory.
"""
def _dgeni_api_docs(ctx):
  input_files = ctx.files.srcs;
  args = ctx.actions.args()
  expected_outputs = [];

  output_dir_name = ctx.attr.name;
  output_dir_path = "%s/%s/%s" % (ctx.bin_dir.path, ctx.label.package, output_dir_name)

  # Do nothing if there are no input files. Bazel will throw if we schedule an action
  # that returns no outputs.
  if not input_files:
    return None

  # Support passing arguments through a parameter file. This is necessary because on Windows
  # there is an argument limit and we need to handle a large amount of input files. Bazel
  # switches between parameter file and normal argument passing based on the operating system.
  # Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
  args.use_param_file(param_file_arg = "--param-file=%s")

  # Pass the path to the package that contains the current Bazel target that is being built.
  # This will be used as a base path to resolve TypeScript source files within Dgeni.
  args.add(ctx.label.package)

  # Pass the path to the output directory. This will be used to instruct Dgeni where the docs
  # output should be written to. (e.g. bazel-out/bin/src/docs-content)
  args.add(output_dir_path)

  # Pass each specified entry point and it's corresponding entry points to Dgeni. This will then
  # be used to resolve the files that need to be parsed by Dgeni.
  for package_name, entry_points in ctx.attr.entry_points.items():
    args.add(package_name)
    args.add_joined(entry_points, join_with = ",")

    for entry_point in entry_points:
      expected_outputs += [
        # Declare the output for the current entry-point. The output file will always follow the
        # same format: "{output_folder}/{package_name}-{entry_point_name}.html"
        # (e.g. "api-docs/material-slider.html")
        ctx.actions.declare_file("%s/%s-%s.html" % (output_dir_name, package_name, entry_point))
      ]

    # Small workaround that ensures that the "ripple" API doc is properly exposed as an output
    # of the packaging rule. Technically Dgeni should not output the "ripple" directory as
    # it's own entry-point. TODO(devversion): Support sub API docs for entry-points
    if package_name == "material":
      expected_outputs += [
        ctx.actions.declare_file("%s/%s-%s.html" % (output_dir_name, package_name, "ripple"))
      ]

  # Run the Dgeni bazel executable which builds the documentation output based on the
  # configured rule attributes.
  ctx.actions.run(
    # Note that we want to add the dgeni template files as well. This makes sure that the
    # templates are available in the sandbox execution and can be read by Dgeni.
    inputs = input_files + ctx.files._dgeni_templates,
    executable = ctx.executable._dgeni_bin,
    outputs = expected_outputs,
    arguments = [args],
    progress_message = "Dgeni (%s)" % (output_dir_path),
  )

  return DefaultInfo(files = depset(expected_outputs))

"""
  Rule definition for the "dgeni_api_docs" rule that can generate API documentation
  for specified packages and their entry points.
"""
dgeni_api_docs = rule(
  implementation = _dgeni_api_docs,
  attrs = {
    # List of labels that need to be available when Dgeni processes the entry points.
    # This usually contains the source files and Angular packages which will be read
    # by the dgeni-packages typeScript processor.
    "srcs": attr.label_list(allow_files = True),

    # String dictionary that defines a package and its entry points. e.g.
    # { "cdk": ["a11y", "platform", "bidi"] }.
    "entry_points": attr.string_list_dict(mandatory = True),

    # Dgeni document templates that should be be available as inputs to the
    # Bazel action. Dgeni tries to resolve templates from the execroot, so they
    # need to be available in the sandbox.
    "_dgeni_templates": attr.label(
      default = Label("//tools/dgeni/templates"),
    ),

    # NodeJS binary target that runs Dgeni and parses the passed command arguments.
    "_dgeni_bin": attr.label(
      default = Label("//tools/dgeni"),
      executable = True,
      cfg = "host"
  )},
)
