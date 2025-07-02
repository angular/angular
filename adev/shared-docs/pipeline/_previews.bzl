def _generate_previews_impl(ctx):
    """Implementation of the previews generator rule"""

    # File declaration of the generated ts file
    ts_output = ctx.actions.declare_file("previews.ts")

    # Set the arguments for the actions inputs and out put location.
    args = ctx.actions.args()

    # Path to the examples for which previews are being generated.
    args.add(ctx.attr.example_srcs.label.package)

    # Path to the preview map template.
    args.add(ctx.file._template_src)

    # Path to the ts output file to write to.
    args.add(ts_output.path)

    ctx.runfiles(files = ctx.files._template_src)

    ctx.actions.run(
        inputs = depset(ctx.files.example_srcs + ctx.files._template_src),
        executable = ctx.executable._generate_previews,
        outputs = [ts_output],
        arguments = [args],
        env = {
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output ts file.
    return [DefaultInfo(files = depset([ts_output]))]

generate_previews = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_previews_impl,
    doc = """Rule that generates a map of example previews to their component""",

    # The attributes that can be set to this rule.
    attrs = {
        "example_srcs": attr.label(
            doc = """Files used for the previews map generation.""",
        ),
        "_template_src": attr.label(
            doc = """The previews map template file to base the generated file on.""",
            default = Label("//adev/shared-docs/pipeline/examples/previews:template"),
            allow_single_file = True,
        ),
        "_generate_previews": attr.label(
            default = Label("//adev/shared-docs/pipeline:previews"),
            executable = True,
            cfg = "exec",
        ),
    },
)
