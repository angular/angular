def _generate_element_api_json(ctx):
    """Implementation of the generate_element_api_json rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Use a param file for consistency with other doc generation rules.
    args.set_param_file_format("multiline")
    args.use_param_file("%s", use_always = True)

    # Pass the set of source files from which the API data will be generated.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Pass the name of the output JSON file.
    manifest = ctx.actions.declare_file("elements.json")
    args.add(manifest.path)

    # Define an action that runs the executable.
    ctx.actions.run(
        inputs = depset(ctx.files.srcs),
        executable = ctx.executable._generate_element_api_json,
        outputs = [manifest],
        arguments = [args],
        env = {
            # Note: This rule access source files directly, without copying them over.
            # Hence we don't need to change the working directory to the bazel-bin.
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output JSON manifest.
    return [DefaultInfo(files = depset([manifest]))]

generate_element_api_json = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_element_api_json,
    doc = """Rule that generates an Angular API doc collection for hand-written element APIs""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """The source files for this rule, must include one or more markdown files.""",
            allow_empty = False,
            allow_files = True,
        ),

        # The executable for this rule (private).
        "_generate_element_api_json": attr.label(
            default = Label("//tools/manual_api_docs:generate_element_api_json"),
            executable = True,
            cfg = "exec",
        ),
    },
)
