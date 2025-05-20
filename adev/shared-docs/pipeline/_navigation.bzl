load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")

def _generate_nav_items(ctx):
    """Implementation of the navigation items data generator rule"""

    # Set the arguments for the actions inputs and output location.
    args = ctx.actions.args()

    # Use a param file because we may have a large number of inputs.
    args.set_param_file_format("multiline")
    args.use_param_file("%s", use_always = True)

    # Pass the set of source files.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Add BUILD file path to the arguments.
    args.add(ctx.label.package)

    # Add the nav item generation strategy to thte arguments.
    args.add(ctx.attr.strategy)

    # File declaration of the generated JSON file.
    json_output = ctx.actions.declare_file("routes.json")

    # Add the path to the output file to the arguments.
    args.add(json_output.path)

    run_node(
        ctx = ctx,
        inputs = depset(ctx.files.srcs),
        executable = "_generate_nav_items",
        outputs = [json_output],
        arguments = [args],
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output json file.
    return [DefaultInfo(files = depset([json_output]))]

generate_nav_items = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_nav_items,
    doc = """Rule that generates navigation items data.""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """Markdown files that represent the page contents.""",
            allow_empty = False,
            allow_files = True,
        ),
        "strategy": attr.string(
            doc = """Represents the navigation items generation strategy.""",
        ),
        "_generate_nav_items": attr.label(
            default = Label("//adev/shared-docs/pipeline:navigation"),
            executable = True,
            cfg = "exec",
        ),
    },
)
