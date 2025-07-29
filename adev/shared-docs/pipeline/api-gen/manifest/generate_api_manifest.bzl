def _generate_api_manifest(ctx):
    """Implementation of the generate_api_manifest rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Use a param file because we may have a large number of json inputs.
    args.set_param_file_format("multiline")
    args.use_param_file("%s", use_always = True)

    # Pass the set of JSON data files from which the API manifest will be generated.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Pass the name of the output JSON file.
    manifest = ctx.actions.declare_file("manifest.json")
    args.add(manifest.path)

    # Define an action that runs the executable.
    ctx.actions.run(
        inputs = depset(ctx.files.srcs),
        executable = ctx.executable._generate_api_manifest,
        outputs = [manifest],
        arguments = [args],
        env = {
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output JSON manifest.
    return [DefaultInfo(files = depset([manifest]))]

generate_api_manifest = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_api_manifest,
    doc = """Rule that generated an Angular API reference manifest from JSON data files
             produced by extract_api_to_json""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """The source files for this rule. This must include one or more
                    JSON data files produced by extract_api_to_json.""",
            allow_empty = False,
            allow_files = True,
        ),

        # The executable for this rule (private).
        "_generate_api_manifest": attr.label(
            default = Label("//adev/shared-docs/pipeline/api-gen/manifest:generate_api_manifest"),
            executable = True,
            cfg = "exec",
        ),
    },
)
