"""Implementation of the expand_template rule """

def expand_template_impl(ctx):
    substitutions = dict()

    for k in ctx.attr.configuration_env_vars:
        if k in ctx.var.keys():
            substitutions["TMPL_%s" % k] = ctx.var[k]

    for k in ctx.attr.substitutions:
        substitutions[k] = ctx.expand_location(ctx.attr.substitutions[k], targets = ctx.attr.data)

    ctx.actions.expand_template(
        template = ctx.file.template,
        output = ctx.outputs.output_name,
        substitutions = substitutions,
    )

"""Rule that can be used to substitute variables in a given template file."""
expand_template = rule(
    implementation = expand_template_impl,
    attrs = {
        "configuration_env_vars": attr.string_list(
            default = [],
            doc = "Bazel configuration variables which should be exposed to the template.",
        ),
        "output_name": attr.output(
            mandatory = True,
            doc = "File where the substituted template is written to.",
        ),
        "substitutions": attr.string_dict(
            mandatory = True,
            doc = "Dictionary of substitutions that should be available to the template. Dictionary key represents the placeholder in the template.",
        ),
        "data": attr.label_list(
            doc = """Data dependencies for location expansion.""",
            allow_files = True,
        ),
        "template": attr.label(
            mandatory = True,
            allow_single_file = True,
            doc = "File used as template.",
        ),
    },
)
