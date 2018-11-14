"""
  Implementation of the "markdown_to_html" rule. The implementation runs the transform
  executable in order to create the outputs for the specified source files.
"""
def _markdown_to_html(ctx):
  input_files = ctx.files.srcs;
  args = ctx.actions.args()
  expected_outputs = [];

  # Add the bazel bin directory to the command arguments. The script needs to know about
  # the output directory because the input files are not in the same location as the bazel
  # bin directory.
  args.add(ctx.bin_dir.path)

  for input_file in input_files:
    # Remove the extension from the input file path. Note that we should not use `.replace`
    # here because the extension can be also in upper case.
    basename = input_file.basename[:-len(".md")]

    # For each input file "xxx.md", we want to write an output file "xxx.html"
    expected_outputs += [ctx.actions.declare_file("%s.html" % basename)]

    # Add the input file to the command line arguments that will be passed to the
    # transform-markdown executable.
    args.add(input_file.path)

  # Run the transform markdown executable that transforms the specified source files.
  # Note that we should specify the outputs here because Bazel can then throw an error
  # if the script didn't generate the required outputs.
  ctx.actions.run(
    inputs = input_files,
    executable = ctx.executable._transform_markdown,
    outputs = expected_outputs,
    arguments = [args],
  )

  return DefaultInfo(files = depset(expected_outputs))

"""
  Rule definition for the "markdown_to_html" rule that can accept arbritary source files
  that will be transformed into HTML files. The outputs can be referenced through the
  default output provider.
"""
markdown_to_html = rule(
  implementation = _markdown_to_html,
  attrs = {
    "srcs": attr.label_list(allow_files = [".md"]),

    # Executable for this rule that is responsible for converting the specified
    # markdown files into HTML files.
    "_transform_markdown": attr.label(
      default = Label("//tools/markdown-to-html"),
      executable = True,
      cfg = "host"
  )},
)
