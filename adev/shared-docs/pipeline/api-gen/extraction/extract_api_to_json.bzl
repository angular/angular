def _extract_api_to_json(ctx):
    """Implementation of the extract_api_to_json rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Use a param file because we may have a large number of inputs.
    args.set_param_file_format("multiline")
    args.use_param_file("%s", use_always = True)

    # Pass the repo name for the extracted APIs. This will be something like "angular/angular".
    args.add(ctx.attr.repo)

    # Pass the module_name for the extracted APIs. This will be something like "@angular/core".
    args.add(ctx.attr.module_name)

    # Pass the module_label for the extracted APIs, This is something like core for "@angular/core".
    args.add(ctx.attr.module_label)

    # Pass the set of private modules that should not be included in the API reference.
    args.add_joined(ctx.attr.private_modules, join_with = ",")

    # Pass the entry_point for from which to extract public symbols.
    args.add(ctx.file.entry_point)

    # Pass the set of source files from which API reference data will be extracted.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Pass the name of the output JSON file.
    json_output = ctx.outputs.output_name
    args.add(json_output.path)

    # Pass the import path map
    path_map = {}
    for target, path in ctx.attr.import_map.items():
        files = target.files.to_list()
        if len(files) != 1:
            fail("Expected a single file in import_map target %s" % target.label)
        path_map[path] = files[0].path
    args.add(json.encode(path_map))

    # Pass the set of (optional) extra entries
    args.add_joined(ctx.files.extra_entries, join_with = ",")

    # Define an action that runs the executable.
    ctx.actions.run(
        inputs = depset(ctx.files.srcs + ctx.files.extra_entries),
        executable = ctx.executable._extract_api_to_json,
        outputs = [json_output],
        arguments = [args],
        env = {
            # Note: We don't need to `cd` into the bin-dir as this action deals with execpaths.
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output JSON files.
    return [DefaultInfo(files = depset([json_output]))]

extract_api_to_json = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _extract_api_to_json,
    doc = """Rule that extracts Angular API reference information from TypeScript
             sources and write it to a JSON file""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """The source files for this rule. This must include one or more
                    TypeScript files.""",
            allow_empty = False,
            allow_files = True,
        ),
        "output_name": attr.output(
            doc = """Name of the JSON output file.""",
        ),
        "entry_point": attr.label(
            doc = """Source file entry-point from which to extract public symbols""",
            mandatory = True,
            allow_single_file = True,
        ),
        "private_modules": attr.string_list(
            doc = """List of private modules that should not be included in the API symbol linking""",
        ),
        "import_map": attr.label_keyed_string_dict(
            doc = """Map of import path to the index.ts file for that import""",
            allow_files = True,
        ),
        "module_name": attr.string(
            doc = """JS Module name to be used for the extracted symbols""",
            mandatory = True,
        ),
        "module_label": attr.string(
            doc = """Module label to be used for the extracted symbols. To be used as display name, for example in API docs""",
        ),
        "repo": attr.string(
            doc = """The name of the github repository the api belongs to""",
            mandatory = True,
        ),
        "extra_entries": attr.label_list(
            doc = """JSON files that contain extra entries to append to the final collection.""",
            allow_files = True,
        ),

        # The executable for this rule (private).
        "_extract_api_to_json": attr.label(
            default = Label("//adev/shared-docs/pipeline/api-gen/extraction:extract_api_to_json"),
            executable = True,
            cfg = "exec",
        ),
    },
)
