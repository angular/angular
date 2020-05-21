"""
  Implementation of the "package_docs_content" rule. The implementation runs the
  packager executable in order to group all specified files into the given sections.
"""

def _package_docs_content(ctx):
    # Arguments that will be passed to the packager executable.
    args = ctx.actions.args()

    # Directory that will contain all grouped input files. This directory will be
    # created relatively to the current target package. For example:
    # "bin/src/components-examples/docs-content/docs-content". The reason we need to
    # repeat `docs-content` is that the ng_package rule does not properly handle tree
    # artifacts in data. Instead, we create a tree artifact that can be put into nested_packages.
    # Nested packages do not preserve the tree artifact name (i.e. the directory name),
    # so all contents of the docs-content would be put directly into the @angular/components-examples package.
    # To avoid that, we create another folder like docs-content in the tree artifact that
    # is preserved as content of the tree artifact.
    output_dir = ctx.actions.declare_directory("%s/%s" % (ctx.attr.name, ctx.attr.name))

    # Support passing arguments through a parameter file. This is necessary because on Windows
    # there is an argument limit and we need to handle a large amount of input files. Bazel
    # switches between parameter file and normal argument passing based on the operating system.
    # Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
    args.use_param_file(param_file_arg = "--param-file=%s", use_always = True)

    # Walk through each defined input target and the associated section and compute the
    # output file which will be added to the executable arguments.
    for input_target, section_name in ctx.attr.srcs.items():
        section_files = input_target.files.to_list()
        base_dir = "%s" % (input_target.label.package)

        for input_file in section_files:
            # Creates a relative path from the input file. We don't want to include the full
            # path in docs content. e.g. `/docs-content/overviews/cdk/src/cdk/a11y/a11y.html`. Instead,
            # we want the path to be: `/docs-content/overviews/cdk/a11y/a11y.html`.
            section_relative_file_name = input_file.short_path[len(base_dir) + 1:]

            # The section name can be empty. This is reasonable when tree artifacts are copied
            # over to the resulting package so that only their contents are transferred.
            # TODO(devversion): Revisit if this can be improved so that the section name
            # is respected. `args.add_all` can unfold tree artifact contents.
            # https://cs.opensource.google/bazel/bazel/+/master:src/main/java/com/google/devtools/build/lib/analysis/skylark/Args.java;l=381-382;drc=9a6997d595fbf3447e911346034edfbde7d8b57e?q=addAll&ss=bazel
            if section_name:
                expected_out_path = "%s/%s/%s" % (output_dir.path, section_name, section_relative_file_name)
            else:
                expected_out_path = "%s/%s" % (output_dir.path, section_relative_file_name)

            # Pass the input file path and the output file path to the packager executable. We need
            # to do this for each file because we cannot determine the general path to the output
            # directory in a reliable way because Bazel targets cannot just "declare" a directory.
            # See: https://docs.bazel.build/versions/master/skylark/lib/actions.html
            args.add("%s,%s" % (input_file.path, expected_out_path))

    # Do nothing if there are no input files. Bazel will throw if we schedule an action
    # that returns no outputs.
    if not ctx.files.srcs:
        return None

    # Run the packager executable that groups the specified source files and writes them
    # to the given output directory.
    ctx.actions.run(
        inputs = ctx.files.srcs,
        executable = ctx.executable._packager,
        outputs = [output_dir],
        arguments = [args],
        progress_message = "PackageDocsContent",
    )

    return DefaultInfo(files = depset([output_dir]))

"""
  Rule definition for the "package_docs_content" rule that can accept arbritary source files
  that will be grouped into specified sections. This is being used to package the docs
  content into a desired folder structure that can be shared with the docs application.
"""
package_docs_content = rule(
    implementation = _package_docs_content,
    attrs = {
        # This defines the sources for the "package_docs_content" rule. Instead of just
        # accepting a list of labels, this rule requires the developer to specify a label
        # keyed dictionary. This allows developers to specify where specific targets
        # should be grouped into. This helpful when publishing the docs content because
        # the docs repository does not about the directory structure of the generated files.
        "srcs": attr.label_keyed_string_dict(allow_files = True),

        # Executable for this rule that is responsible for packaging the specified
        # targets into the associated sections.
        "_packager": attr.label(
            default = Label("//tools/package-docs-content"),
            executable = True,
            cfg = "host",
        ),
    },
)
