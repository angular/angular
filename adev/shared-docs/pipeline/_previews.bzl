load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")

def _generate_previews(ctx):
    """Implementation of the previews generator rule"""

    # File declaration of the generated ts file
    ts_output = ctx.actions.declare_file("previews.ts")

    # Set the arguments for the actions inputs and out put location.
    args = ctx.actions.args()

    # Path to the examples for which previews are being generated.
    args.add(ctx.attr.example_srcs.label.package)

    # Path to the preview map template.
    args.add(ctx.file.template_src)

    # Path to the ts output file to write to.
    args.add(ts_output.path)

    ctx.runfiles(files = ctx.files.template_src)

    run_node(
        ctx = ctx,
        inputs = depset(ctx.files.example_srcs + ctx.files.template_src),
        executable = "_generate_previews",
        outputs = [ts_output],
        arguments = [args],
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output ts file.
    return [DefaultInfo(files = depset([ts_output]))]

generate_previews = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_previews,
    doc = """Rule that generates a map of example previews to their component""",

    # The attributes that can be set to this rule.
    attrs = {
        "example_srcs": attr.label(
            doc = """Files used for the previews map generation.""",
        ),
        "template_src": attr.label(
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
