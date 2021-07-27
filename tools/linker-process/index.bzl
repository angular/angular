"""
 Exposes a custom Bazel rule for processing sources, which are extracted from Bazel
 targets, with the Angular linker plugin.
"""

load("@build_bazel_rules_nodejs//:providers.bzl", "JSModuleInfo", "JSNamedModuleInfo")

"""
Gets the Bazel manifest path for a given file. Manifest paths are used within Bazel runfile
manifests and are formatted as followed: `<workspace_name>/<workspace_relative_file_path>`
"""

def _to_manifest_path(ctx, file):
    # If a file resides outside of the current workspace, we omit the leading `../`
    # segment as the rest will contain the workspace name. e.g. `../npm/node_modules/<..>`.
    if file.short_path.startswith("../"):
        return file.short_path[3:]
    else:
        return ctx.workspace_name + "/" + file.short_path

"""Extracts all source files from the specified list of dependencies."""

def _extract_source_files(deps):
    depsets = []
    for dep in deps:
        if JSNamedModuleInfo in dep:
            depsets.append(dep[JSNamedModuleInfo].sources)
        elif JSModuleInfo in dep:
            depsets.append(dep[JSModuleInfo].sources)
        elif hasattr(dep, "files"):
            depsets.append(dep.files)
    return depset(transitive = depsets)

def _linker_process(ctx):
    args = ctx.actions.args()
    sources = _extract_source_files(ctx.attr.srcs)
    tmp_dir_name = ctx.label.name

    # The output directory manifest path. e.g `angular_material/src/cdk/a11y/linker_processed`.
    output_dir_manifest_path = "%s/%s/%s" % (ctx.workspace_name, ctx.label.package, tmp_dir_name)

    # The output directory exec path. e.g `bazel_out/<..>/src/cdk/a11y/linker_processed`.
    output_dir_exec_path = "%s/%s/%s" % (ctx.bin_dir.path, ctx.label.package, tmp_dir_name)

    # Given the sources being transformed and written to a new location, the AMD module names
    # need to be rewritten. This file maps AMD modules as per the new location to the AMD modules
    # as they appear in the sources. i.e. we generate AMD module aliases.
    amd_module_mapping_file = ctx.actions.declare_file("%s/_module_mappings.js" % tmp_dir_name)

    args.add(output_dir_exec_path)
    args.add(output_dir_manifest_path)
    args.add(amd_module_mapping_file.path)

    outputs = [amd_module_mapping_file]

    # Iterate through the determined sources and pass them to the tool as argument.
    for input_file in sources.to_list():
        output_pkg_path = _to_manifest_path(ctx, input_file)
        args.add("%s:%s" % (input_file.path, output_pkg_path))
        outputs.append(ctx.actions.declare_file("%s/%s" % (tmp_dir_name, output_pkg_path)))

    # Support passing arguments through a parameter file. This is necessary because on Windows
    # there is an argument limit and we need to handle a large amount of input files. Bazel
    # switches between parameter file and normal argument passing based on the operating system.
    # Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
    args.use_param_file(param_file_arg = "--param-file=%s", use_always = True)

    ctx.actions.run(
        inputs = sources,
        outputs = outputs,
        executable = ctx.executable._linker_process_tool,
        arguments = [args],
        progress_message = "NgLinkerProcess",
    )

    outputs_depset = depset(outputs)

    return [
        DefaultInfo(files = outputs_depset),
    ]

"""
  Rule definition for the "linker_process" rule that can process a list of targets
  with the Angular linker. The processed files can be retrieved through the default
  files provider.
"""
linker_process = rule(
    implementation = _linker_process,
    attrs = {
        "srcs": attr.label_list(
            allow_files = True,
            doc = """List of sources that should be processed with the Angular linker.""",
        ),
        "_linker_process_tool": attr.label(
            default = Label("//tools/linker-process"),
            executable = True,
            cfg = "host",
        ),
    },
)
