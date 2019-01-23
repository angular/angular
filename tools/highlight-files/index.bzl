"""
  Gets a path relative to the specified label. This is achieved by just removing the label
  package path from the specified path. e.g. the path is "guides/test/my-text.md" and the
  label package is "guides/". The expected path would be "test/my-text.md".
"""
def _relative_to_label(label, short_path):
  # TODO(devversion): extract into generic utility under tools/
  return short_path[len(label.package) + 1:]

"""
  Implementation of the "highlight_files" rule. The implementation runs the
  highlight-files executable in order to highlight the specified source files.
"""
def _highlight_files(ctx):
  input_files = ctx.files.srcs;
  args = ctx.actions.args()
  expected_outputs = [];

  # Do nothing if there are no input files. Bazel will throw if we schedule an action
  # that returns no outputs.
  if not input_files:
    return None

  # Support passing arguments through a parameter file. This is necessary because on Windows
  # there is an argument limit and we need to handle a large amount of input files. Bazel
  # switches between parameter file and normal argument passing based on the operating system.
  # Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
  args.use_param_file(param_file_arg = "--param-file=%s")

  # Add the bazel bin directory to the command arguments. The script needs to know about
  # the output directory because the input files are not in the same location as the bazel
  # bin directory.
  args.add(ctx.bin_dir.path)

  for input_file in input_files:
    # Extension of the input file (e.g. "ts" or "css")
    file_extension = input_file.extension

    # Determine the input file path relatively to the current package path. This is necessary
    # because we want to preserve directories for the input files and `declare_file` expects a
    # path that is relative to the current package. We remove the file extension including the dot
    # because we will constructo an output file using a different extension.
    relative_basepath = _relative_to_label(ctx.label, input_file.short_path)[
      :-len(file_extension) - 1]

    # Construct the output path from the relative basepath and file extension. For example:
    # "autocomplete.ts" should result in "autocomplete-ts.html".
    expected_outputs += [
      ctx.actions.declare_file("%s-%s.html" % (relative_basepath, file_extension)),
    ]

    # Add the path for the input file to the command line arguments, so that the executable
    # can process it.
    args.add(input_file.path)

  # Run the highlight-files executable that highlights the specified source files.
  ctx.actions.run(
    inputs = input_files,
    executable = ctx.executable._highlight_files,
    outputs = expected_outputs,
    arguments = [args],
    progress_message = "HighlightFiles",
  )

  return DefaultInfo(files = depset(expected_outputs))

"""
  Rule definition for the "highlight_files" rule that can accept arbritary source files
  that will be transformed into HTML files which reflect the highlighted source code of
  the given files. The outputs can be referenced through the default output provider.
"""
highlight_files = rule(
  implementation = _highlight_files,
  attrs = {
    "srcs": attr.label_list(allow_files = True),

    # Executable for this rule that is responsible for highlighting the specified
    # input files.
    "_highlight_files": attr.label(
      default = Label("//tools/highlight-files"),
      executable = True,
      cfg = "host"
  )},
)
