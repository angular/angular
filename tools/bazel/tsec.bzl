"""Bazel rules and macros for running tsec over a ng_module or ts_library."""

load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("@aspect_rules_ts//ts:defs.bzl", "TsConfigInfo")
load("@bazel_skylib//lib:new_sets.bzl", "sets")
load("@npm//:tsec/package_json.bzl", tsec = "bin")

TsecTargetInfo = provider(
    "Attributes required for tsec_test to generate tsconfig.json",
    fields = ["srcs", "deps"],
)

def _capture_tsec_attrs_aspect_impl(_, ctx):
    """Capture certain srcs and deps from of `the ts_project` into a TsecTargetInfo provider."""
    deps = []
    for dep in getattr(ctx.rule.attr, "deps", []):
        if JsInfo in dep:
            deps.append(dep[JsInfo].transitive_types)
            deps.append(dep[JsInfo].types)

    srcs = getattr(ctx.rule.attr, "srcs", [])

    return [
        TsecTargetInfo(
            srcs = srcs,
            deps = depset(transitive = deps),
        ),
    ]

_capture_tsec_attrs_aspect = aspect(
    implementation = _capture_tsec_attrs_aspect_impl,
    attr_aspects = ["deps"],
)

def _tsec_config_impl(ctx):
    deps = []
    use_runfiles = ctx.attr.use_runfiles
    base_tsconfig = None
    tsconfig = ctx.attr.tsconfig

    # Gather all base tsconfig files and the exemption list.
    if tsconfig:
        if TsConfigInfo not in tsconfig:
            fail("`tsconfig` must be a ts_config target")
        deps.extend(tsconfig[TsConfigInfo].deps.to_list())
        base_tsconfig = tsconfig.files.to_list()[0]

    deps.append(ctx.file._exemption)

    out = ctx.outputs.out
    ts_target = ctx.attr.target

    ######################################################################################
    ### GENERATE A TSCONFIG DICT TO ENABLE THE TSEC PLUGIN AND LIST ALL AVAILABLE FILE ###
    ######################################################################################
    tsconfig = {}
    pkg_base_dir = "/".join([".."] * len(ts_target.label.package.split("/")))

    # With runfiles, the location of the source code is the same as the generated .d.ts, i.e., the workspace root.
    # Without runfiles, the source code remains in the Bazel package folder in the source tree, so `src_base_dir`
    # has to go to the execroot first and further back to the source tree.
    src_base_dir = pkg_base_dir if use_runfiles else "/".join([".."] * len(ctx.bin_dir.path.split("/")) + [pkg_base_dir])

    # The relative path to the base directory
    base = src_base_dir if base_tsconfig.is_source else pkg_base_dir

    # Extend the provided tsconfig file.
    tsconfig["extends"] = base + "/" + base_tsconfig.short_path

    # Create the compilerOption field for the tsconfig file.
    compiler_options = {
        "noEmit": True,
        "plugins": [{
            "name": "tsec",
            "exemptionConfig": base + "/" + ctx.file._exemption.short_path,
        }],
    }

    if not use_runfiles:
        compiler_options["rootDirs"] = [src_base_dir, src_base_dir + "/" + ctx.bin_dir.path]

    tsconfig["compilerOptions"] = compiler_options

    # Generate the list of files available for the tsc execution.
    files = sets.make()

    # Helper function for adding a file to the `files` set.
    def add_file_to_set(file):
        if file.extension not in ["ts", "tsx"]:
            return
        base = src_base_dir if file.is_source else pkg_base_dir
        sets.insert(files, base + "/" + file.short_path)

    # Add all of the source typescript files from the target to the files list.
    for src in ts_target[TsecTargetInfo].srcs:
        for f in src.files.to_list():
            add_file_to_set(f)

    # Add all of the source typescript files from the target's deps to the files list.
    for f in ts_target[TsecTargetInfo].deps.to_list():
        add_file_to_set(f)

    # Add the list of files to the tsconfig
    tsconfig["files"] = sets.to_list(files)
    ######################################################################################

    # Write the generated tsconfig file and place it in the output
    ctx.actions.write(output = out, content = json.encode(tsconfig))
    deps.append(out)

    return [DefaultInfo(files = depset(deps))]

_tsec_config = rule(
    implementation = _tsec_config_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            aspects = [_capture_tsec_attrs_aspect],
            doc = """The ts_library target for which the tsconfig is generated.""",
        ),
        "tsconfig": attr.label(
            doc = """Base tsconfig to extend from.""",
        ),
        "use_runfiles": attr.bool(mandatory = True),
        "out": attr.output(mandatory = True),
        "_exemption": attr.label(
            default = "//packages:tsec_exemption",
            allow_single_file = True,
        ),
    },
    doc = """Generate the tsconfig.json for a tsec_test. """,
)

def _all_transitive_deps_impl(ctx):
    if TsecTargetInfo not in ctx.attr.target:
        fail("`target` must be a ts_project target")

    # A list of all files that are transitively depended on by the target.
    files = []
    for s in ctx.attr.target[TsecTargetInfo].srcs:
        files.extend(s.files.to_list())

    for file in ctx.attr.target[TsecTargetInfo].deps.to_list():
        # Skip all files that are external as they cannot be copied into the output_tree
        if file.owner.workspace_root.startswith("external"):
            continue
        files.append(file)

    return [DefaultInfo(files = depset(files))]

_all_transitive_deps = rule(
    implementation = _all_transitive_deps_impl,
    attrs = {"target": attr.label(aspects = [_capture_tsec_attrs_aspect])},
    doc = """Expand all transitive dependencies needed to run `_tsec_test`.""",
)

def tsec_test(name, target, tsconfig, use_runfiles_on_windows = True):
    """Run tsec over a ts_library or ng_module target to check its compatibility with Trusted Types.

    This rule DOES NOT check transitive dependencies.
    Args:
        name: name of the tsec test
        target: the ts_library or ng_module target to be checked
        tsconfig: the ts_config target used for configuring tsec
        use_runfiles_on_windows: whether to force using runfiles on Windows
    """
    tsec_tsconfig_name = "%s_tsconfig" % name
    generated_tsconfig = "%s_tsconfig.json" % name

    use_runfiles = use_runfiles_on_windows or select({
        "@platforms//os:windows": False,
        "//conditions:default": True,
    })

    _tsec_config(
        name = tsec_tsconfig_name,
        testonly = True,
        tags = ["tsec"],
        target = target,
        tsconfig = tsconfig,
        use_runfiles = use_runfiles,
        out = generated_tsconfig,
    )

    all_transitive_deps_name = "%s_deps" % name
    _all_transitive_deps(
        name = all_transitive_deps_name,
        testonly = True,
        tags = ["tsec"],
        target = target,
    )

    tsec.tsec_test(
        name = name,
        data = [
            tsec_tsconfig_name,
            target,
            all_transitive_deps_name,
            generated_tsconfig,
        ],
        tags = ["tsec"],
        fixed_args = ["-p", "$(rootpath %s)" % generated_tsconfig],
    )
