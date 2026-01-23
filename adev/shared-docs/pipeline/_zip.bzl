def _generate_zip(ctx):
    """Implementation of the zip generator rule"""

    # Determine the template base directory
    # Create an initial string of length greater than the length the template path will
    # be. This is used so that the first file path we encounter is used as the initial value.
    template_srcs = " " * 10000
    for file in ctx.files.template_srcs:
        file_path = file.dirname
        if (len(file_path) < len(template_srcs)):
            template_srcs = file_path

    # File declaration of the generated zip file
    zip_output = ctx.actions.declare_file("%s.zip" % ctx.attr.name)

    # Temporary directory for the generation to utilize
    tmp_directory = ctx.actions.declare_directory("TMP_" + ctx.label.name)

    # Set the arguments for the actions inputs and output location.
    args = ctx.actions.args()

    # Path to the example being generated.
    args.add(ctx.attr.example_srcs.label.package)

    # Path to the actions temporary directory.
    args.add(tmp_directory.short_path)

    # Path to the stackblitz template
    args.add(template_srcs)

    # Path to the html output file to write to.
    args.add(zip_output.path)

    ctx.runfiles(files = ctx.files.template_srcs)

    ctx.actions.run(
        ctx = ctx,
        inputs = depset(ctx.files.example_srcs + ctx.files.template_srcs),
        executable = ctx.executable._generate_zip,
        outputs = [zip_output, tmp_directory],
        arguments = [args],
        env = {
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output html files.
    return [DefaultInfo(files = depset([zip_output]))]

generate_zip = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_zip,
    doc = """Rule that generates zip of example directory""",

    # The attributes that can be set to this rule.
    attrs = {
        "example_srcs": attr.label(
            doc = """Files used for the zip generation.""",
        ),
        "template_srcs": attr.label(
            doc = """The template directory to base zip on.""",
            default = Label("//adev/shared-docs/pipeline/examples/template:files"),
        ),
        "_generate_zip": attr.label(
            default = Label("//adev/shared-docs/pipeline:zip"),
            executable = True,
            cfg = "exec",
        ),
    },
)
