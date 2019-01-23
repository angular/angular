"""
  Gets a path relative to the specified label. This is achieved by just removing the label
  package path from the specified path. e.g. the path is "guides/test/my-text.md" and the
  label package is "guides/". The expected path would be "test/my-text.md".
"""
def _relative_to_label(label, short_path):
  return short_path[len(label.package) + 1:]

"""
  Implementation of the "markdown_to_html" rule. The implementation runs the transform
  executable in order to create the outputs for the specified source files.
"""
def _markdown_to_html(ctx):
  input_files = ctx.files.srcs;
  args = ctx.actions.args()
  expected_outputs = [];

  # Do nothing if there are no input files. Bazel will throw if we schedule an action
  # that returns no outputs.
  if not input_files:
    return None

  # Add the bazel bin directory to the command arguments. The script needs to know about
  # the output directory because the input files are not in the same location as the bazel
  # bin directory.
  args.add(ctx.bin_dir.path)

  for input_file in input_files:
    # Determine the input file path relatively to the current package path. This is necessary
    # because we want to preserve directories for the input files and `declare_file` expects a
    # path that is relative to the current package. Also note that we should not use `.replace`
    # here because the extension can be also in upper case.
    relative_basepath = _relative_to_label(ctx.label, input_file.short_path)[:-len(".md")]

    # For each input file "xxx.md", we want to write an output file "xxx.html"
    expected_outputs += [ctx.actions.declare_file("%s.html" % relative_basepath)]

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
    progress_message = "MarkdownToHtml",
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
