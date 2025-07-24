load("//adev/shared-docs:defaults.bzl", "path_relative_to_label")

def _generate_guides(ctx):
    """Implementation of the markdown rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Use a param file because we may have a large number of inputs.
    args.set_param_file_format("multiline")
    args.use_param_file("%s", use_always = True)

    # Pass the set of source files.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Pass the the output directory path (which is the bazel-bin directory).
    args.add(ctx.bin_dir.path)

    # Determine the set of html output files. For each input markdown file, produce an html
    # file with the same name (replacing the markdown extension with `.html`).
    html_outputs = []
    for input_file in ctx.files.srcs:
        # Determine the input file path relatively to the current package path. We do this
        # because we want to preserve directories for the input files and `declare_file` expects a
        # path that is relative to the current package. We don't use `.replace`
        # here because the extension can be also in upper case.
        relative_basepath = path_relative_to_label(ctx.label, input_file.short_path)

        # For each input file "xxx.md", we want to write an output file "xxx.html"
        html_outputs += [ctx.actions.declare_file("%s.html" % relative_basepath)]

    # Define an action that runs the nodejs_binary executable. This is the main thing that this
    # rule does. If mermaid blocks are enabled then a different executable is used.
    if (ctx.attr.mermaid_blocks):
        ctx.actions.run(
            inputs = depset(ctx.files.srcs + ctx.files.data),
            executable = ctx.executable._generate_guides,
            outputs = html_outputs,
            arguments = [args],
            env = {
                "BAZEL_BINDIR": ".",
            },
        )
    else:
        ctx.actions.run(
            inputs = depset(ctx.files.srcs + ctx.files.data),
            executable = ctx.executable._generate_guides_no_mermaid,
            outputs = html_outputs,
            arguments = [args],
            env = {
                "BAZEL_BINDIR": ".",
            },
        )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output html files.
    return [DefaultInfo(files = depset(html_outputs))]

generate_guides = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_guides,
    doc = """Rule that renders markdown sources to html""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """Markdown sources to render to html.""",
            allow_empty = False,
            allow_files = True,
        ),
        "data": attr.label_list(
            doc = """Source referenced from within the markdown.""",
            allow_files = True,
        ),
        "mermaid_blocks": attr.bool(
            doc = """Whether to transform mermaid blocks.""",
            default = False,
        ),

        # The executable for this rule (private).
        "_generate_guides": attr.label(
            default = Label("//adev/shared-docs/pipeline:markdown"),
            executable = True,
            cfg = "exec",
        ),
        # The executable for this rule when no mermaid process is required (private).
        "_generate_guides_no_mermaid": attr.label(
            default = Label("//adev/shared-docs/pipeline:markdown_no_mermaid"),
            executable = True,
            cfg = "exec",
        ),
    },
)
