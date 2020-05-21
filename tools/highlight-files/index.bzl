"""
  Implementation of the "highlight_files" rule. The implementation runs the
  highlight-files executable in order to highlight the specified source files.
"""

def _highlight_files(ctx):
    input_files = ctx.files.srcs
    args = ctx.actions.args()
    output_dir = ctx.actions.declare_directory(ctx.label.name)

    # Do nothing if there are no input files. Bazel will throw if we schedule an action
    # that returns no outputs.
    if not input_files:
        return None

    # Support passing arguments through a parameter file. This is necessary because on Windows
    # there is an argument limit and we need to handle a large amount of input files. Bazel
    # switches between parameter file and normal argument passing based on the operating system.
    # Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
    args.use_param_file(param_file_arg = "--param-file=%s")

    # Add the output directory path to the command arguments
    args.add(output_dir.path)

    # Add the name of the label package. This will be used in the
    # action to compute package-relative paths.
    args.add(ctx.label.package)

    # Add the input files to the command arguments. These files will
    # be processed by the highlight binary.
    args.add_all(input_files)

    # Run the highlight-files executable that highlights the specified source files.
    ctx.actions.run(
        inputs = input_files,
        executable = ctx.executable._highlight_files,
        outputs = [output_dir],
        arguments = [args],
        progress_message = "HighlightFiles",
    )

    return DefaultInfo(files = depset([output_dir]))

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
            cfg = "host",
        ),
    },
)
