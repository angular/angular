def _render_api_to_html(ctx):
    """Implementation of the render_api_to_html rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Use a param file because we may have a large number of json inputs
    args.set_param_file_format("multiline")
    args.use_param_file("%s", use_always = True)

    # Pass the list of json data files from which documents will be generated.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Declare the output directory for rendered html documents.
    # If you have e.g. `api_gen(name = "docs")`, this will be "docs_html".
    output_dir = ctx.attr.name + "_html"
    html_output_directory = ctx.actions.declare_directory(output_dir)
    args.add(html_output_directory.path)
    outputs = [html_output_directory]

    # Path to the defined-routes manifest used to validate guide links in JSDoc and markdown.
    # The manifest is a flat JSON array of route paths and `route#anchor` entries derived from
    # the application's navigation tree.
    args.add(ctx.file.defined_routes.path)
    inputs = ctx.files.srcs + [ctx.file.defined_routes]

    # Define an action that runs the executable.
    ctx.actions.run(
        inputs = depset(inputs),
        executable = ctx.executable._render_api_to_html,
        outputs = outputs,
        arguments = [args],
        mnemonic = "RenderApiToHtml",
        env = {
            "BAZEL_BINDIR": ".",
        },
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output HTML files.
    return [DefaultInfo(files = depset(outputs))]

render_api_to_html = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _render_api_to_html,
    doc = """Rule that consumes extracted Angular docs data (from extract_api_to_json)
            and renders it to html""",

    # The attributes that can be set to this rule.
    attrs = {
        # The source files for this rule. This must include one or more json data files.
        "srcs": attr.label_list(allow_empty = False, allow_files = True),

        # Defined-routes manifest produced by //adev/scripts/routes:run_generate_route. Used
        # to validate `/guide/...` URLs in `{@link}` JSDoc tags and markdown links.
        "defined_routes": attr.label(
            default = Label("//adev/scripts/routes:defined-routes.json"),
            allow_single_file = [".json"],
        ),

        # The executable for this rule (private).
        "_render_api_to_html": attr.label(
            default = Label("//adev/shared-docs/pipeline/api-gen/rendering:render_api_to_html"),
            executable = True,
            cfg = "exec",
        ),
    },
)
