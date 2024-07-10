load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "declaration_info")

def bundle_type_declaration(
        ctx,
        entry_point,
        output_file,
        types,
        license_banner_file = None):
    """Rule helper for registering a bundle type declaration action."""

    # Microsoft's API extractor requires a `package.json` file to be provided. We
    # auto-generate such a file since such a file needs to exist on disk.
    package_json = ctx.actions.declare_file(
        "__api-extractor.json",
        sibling = output_file,
    )
    ctx.actions.write(package_json, content = json.encode({
        "name": "auto-generated-for-api-extractor",
    }))

    inputs = [package_json]
    args = ctx.actions.args()
    args.add(entry_point.path)
    args.add(output_file.path)
    args.add(package_json.path)

    if license_banner_file:
        args.add(license_banner_file.path)
        inputs.append(license_banner_file)

    # Pass arguments using a flag-file prefixed with `@`. This is
    # a requirement for build action arguments in persistent workers.
    # https://docs.bazel.build/versions/main/creating-workers.html#work-action-requirements.
    args.use_param_file("@%s", use_always = True)
    args.set_param_file_format("multiline")

    ctx.actions.run(
        mnemonic = "BundlingTypes",
        inputs = depset(inputs, transitive = [types]),
        outputs = [output_file],
        executable = ctx.executable._types_bundler_bin,
        arguments = [args],
        execution_requirements = {"supports-workers": "1"},
        progress_message = "Bundling types (%s)" % entry_point.short_path,
    )

def _types_bundle_impl(ctx):
    """Implementation of the "types_bundle" rule."""

    output = ctx.outputs.output_name
    entry_point_short_path = "%s/%s" % (ctx.label.package, ctx.attr.entry_point)
    entry_point_file = None
    direct_types_depsets = []
    type_depsets = []

    for dep in ctx.attr.deps:
        if DeclarationInfo in dep:
            direct_types_depsets.append(dep[DeclarationInfo].declarations)
            type_depsets.append(dep[DeclarationInfo].transitive_declarations)

    types = depset(transitive = type_depsets)

    # Note: Using `to_list()` is expensive but we cannot get around this here as
    # we need to find a reference to the entry-point. We only care about direct
    # types though, so the performance impact is rather low.
    direct_types = depset(transitive = direct_types_depsets)
    direct_types_list = direct_types.to_list()

    # Iterate through the types and look for the entry point `File`.
    for file in direct_types_list:
        if file.short_path == entry_point_short_path:
            entry_point_file = file
            break

    if entry_point_file == None:
        fail("Could not find entry-point file: %s" % entry_point_short_path)

    bundle_type_declaration(
        ctx = ctx,
        entry_point = entry_point_file,
        output_file = output,
        types = types,
    )

    output_depset = depset([output])

    return [
        DefaultInfo(files = output_depset),
        declaration_info(output_depset),
    ]

types_bundle = rule(
    implementation = _types_bundle_impl,
    attrs = {
        "deps": attr.label_list(
            doc = "List of targets which are required for bundling the entry-point.",
            providers = [DeclarationInfo],
            mandatory = True,
            allow_files = True,
        ),
        "output_name": attr.output(
            doc = "Output file name for the types bundle.",
            mandatory = True,
        ),
        "entry_point": attr.string(
            doc = "Package-relative path to the entry-point type file which should be bundled.",
            mandatory = True,
        ),
        "_types_bundler_bin": attr.label(
            default = "//packages/bazel/src/types_bundle:types_bundler",
            cfg = "exec",
            executable = True,
        ),
    },
)
