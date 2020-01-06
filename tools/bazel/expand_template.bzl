"""Implementation of the expand_template rule """

def expand_template_impl(ctx):
    substitutions = dict(**ctx.attr.substitutions)

    for k in ctx.attr.configuration_env_vars:
        if k in ctx.var.keys():
            substitutions["$%s_TMPL" % k.upper()] = ctx.var[k]

    ctx.actions.expand_template(
        template = ctx.file.template,
        output = ctx.outputs.output_name,
        substitutions = substitutions,
    )

"""
  Rule that can be used to output a file from a specified
  template by applying given substitutions.
"""
expand_template = rule(
    implementation = expand_template_impl,
    attrs = {
        "configuration_env_vars": attr.string_list(default = []),
        "output_name": attr.output(mandatory = True),
        "substitutions": attr.string_dict(mandatory = True),
        "template": attr.label(mandatory = True, allow_single_file = True),
    },
)
