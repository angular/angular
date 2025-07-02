def _generate_tutorial(ctx):
    """Implementation of the tutorial generator rule"""

    # Determine the common directory base
    # Create an initial string of length greater than the length the common directory path will
    # be. This is used so that the first file path we encounter is used as the initial value.
    common_srcs = " " * 10000
    for file in ctx.files.common_srcs:
        file_path = file.dirname
        if (len(file_path) < len(common_srcs)):
            common_srcs = file_path

    # The directory being generated into
    tutorial_directory = ctx.actions.declare_directory(ctx.label.name)

    # Set the arguments for the actions inputs and output location.
    args = ctx.actions.args()

    # Path to the tutorial being generated.
    args.add(ctx.attr.tutorial_srcs.label.package)

    # Path to the common directory
    args.add(common_srcs)

    # Path to the html output file to write to.
    args.add(tutorial_directory.path)

    ctx.runfiles(files = ctx.files.common_srcs)

    ctx.actions.run(
        inputs = depset(ctx.files.tutorial_srcs + ctx.files.common_srcs),
        executable = ctx.executable._generate_tutorial,
        outputs = [tutorial_directory],
        arguments = [args],
        env = {
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output html files.
    return [DefaultInfo(files = depset([tutorial_directory]))]

generate_tutorial = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_tutorial,
    doc = """Rule that generates tutorial source and configuration files.""",

    # The attributes that can be set to this rule.
    attrs = {
        "tutorial_srcs": attr.label(
            doc = """Files used for the tutorial generation.""",
        ),
        "common_srcs": attr.label(
            doc = """The directory containing the base files to expand upon.""",
            default = Label("//adev/shared-docs/pipeline/tutorials/common:files"),
        ),
        "_generate_tutorial": attr.label(
            default = Label("//adev/shared-docs/pipeline:tutorial"),
            executable = True,
            cfg = "exec",
        ),
    },
)
