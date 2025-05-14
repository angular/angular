"""Bazel rules and macros for running tsec over a ng_module or ts_library."""

load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("@bazel_skylib//lib:new_sets.bzl", "sets")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")
load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "NpmPackageInfo")
load("@npm//@bazel/concatjs/internal:ts_config.bzl", "TsConfigInfo")

TsecInteropSrcs = provider("Sources used by an interop target", fields = ["srcs"])
TsecTargetInfo = provider("Attributes required for tsec_test to generate tsconfig.json", fields = ["srcs", "deps", "module_name", "paths", "node_modules_root"])

def _capture_tsec_attrs_aspect_impl(target, ctx):
    """Capture certain attributes of `ts_library` into a TsecTargetInfo provider."""

    # If we come across a `ts_project`, don't propagate anything. All information
    # has to go through the interop targets and the logic below. We just expose
    # the real `.ts` sources here.
    if ctx.rule.kind == "ts_project":
        return [
            TsecInteropSrcs(
                srcs = ctx.rule.attr.srcs,
            ),
        ]

    module_name_from_providers = getattr(target, "module_name", None)
    module_name_from_attrs = getattr(ctx.rule.attr, "module_name", None)
    module_name = module_name_from_providers if module_name_from_providers else module_name_from_attrs
    module_root = getattr(ctx.rule.attr, "module_root", None)

    paths = {}
    deps = []
    node_modules_root = None
    if module_name:
        paths[module_name] = "%s/%s" % (target.label.package, module_root) if module_root else target.label.package

    # Note: We might come across an interop target. Their deps include the RJS deps
    # as well. Those might ultimately point to a real `//:node_modules/x` target without
    # any `deps` attribute. This is fine as we also get the "rules_nodejs" target; so
    # gracefully proceed with an empty set of "deps" then.
    for d in getattr(ctx.rule.attr, "deps", []):
        if TsecTargetInfo in d:
            paths.update(d[TsecTargetInfo].paths)
        if DeclarationInfo in d:
            deps.append(d[DeclarationInfo].transitive_declarations)
        if JsInfo in d:
            deps.append(d[JsInfo].transitive_types)
        if node_modules_root == None and NpmPackageInfo in d:
            node_modules_root = "/".join(["external", d[NpmPackageInfo].workspace, "node_modules"])

    srcs = getattr(ctx.rule.attr, "srcs", [])

    # If this is an interop target, pull the `srcs` from the underlying `ts_project`.
    if ctx.rule.kind == "ts_project_module":
        srcs = ctx.rule.attr.dep[TsecInteropSrcs].srcs

    return [
        TsecTargetInfo(
            srcs = srcs,
            deps = depset(transitive = deps),
            module_name = module_name,
            paths = paths,
            node_modules_root = node_modules_root,
        ),
    ]

_capture_tsec_attrs_aspect = aspect(
    implementation = _capture_tsec_attrs_aspect_impl,
    attr_aspects = ["deps", "dep"],
)

def _generate_tsconfig(bin_dir_path, target, base_tsconfig, use_runfiles):
    tsconfig = {"bazel": True}
    pkg_base_dir = "/".join([".."] * len(target.label.package.split("/")))

    # With runfiles, the location of the source code is the same as the generated .d.ts, i.e., the workspace root.
    # Without runfiles, the source code remains in the Bazel package folder in the source tree, so `src_base_dir`
    # has to go to the execroot first and further back to the source tree.
    src_base_dir = pkg_base_dir if use_runfiles else "/".join([".."] * len(bin_dir_path.split("/")) + [pkg_base_dir])

    if base_tsconfig:
        base = src_base_dir if base_tsconfig.is_source else pkg_base_dir
        tsconfig["extends"] = base + "/" + base_tsconfig.short_path

    compiler_options = {"noEmit": True}
    compiler_options["baseUrl"] = src_base_dir

    tslib_info = target[TsecTargetInfo]
    paths = {}
    for name, path in tslib_info.paths.items():
        paths[name] = [path]
        paths["%s/*" % name] = ["%s/*" % path]

        if not use_runfiles:
            paths[name].append(bin_dir_path + "/" + path)

    node_modules_root = tslib_info.node_modules_root
    if node_modules_root != None:
        type_roots = [node_modules_root, node_modules_root + "/@types"]
        paths["*"] = ["%s/*" % r for r in type_roots]
        compiler_options["typeRoots"] = ["%s/%s/*" % (src_base_dir, r) for r in type_roots]

    compiler_options["paths"] = paths

    if not use_runfiles:
        compiler_options["rootDirs"] = [src_base_dir, src_base_dir + "/" + bin_dir_path]

    tsconfig["compilerOptions"] = compiler_options

    files = sets.make()
    for s in tslib_info.srcs:
        if hasattr(s, "files"):
            for f in s.files.to_list():
                base = src_base_dir if f.is_source else pkg_base_dir
                sets.insert(files, base + "/" + f.short_path)

    for f in tslib_info.deps.to_list():
        # Do not include non-TS files
        if f.extension not in ["ts", "tsx"]:
            continue

        path = f.short_path

        # Do not include ngc produced files
        if path.endswith(".ngfactory.d.ts") or path.endswith(".ngsummary.d.ts"):
            continue

        if not use_runfiles and f.owner.workspace_name == "npm":
            # For npm hosted source files, we need to go further back two levels
            # of directories (workspace and execroot) from `src_base_dir`, and
            # then go to node_modules_root (and trim off the redundant "npm"
            # segment that exists in both `path` and `node_modules_root`.
            base = "../../%s/%s/.." % (src_base_dir, node_modules_root)
        else:
            base = src_base_dir if f.is_source else pkg_base_dir

        sets.insert(files, base + "/" + path)

    tsconfig["files"] = sets.to_list(files)

    return json.encode(tsconfig)

TsecTsconfigInfo = provider("Transitive depenedencies of tsconfig for tsec_test", fields = ["files"])

def _tsec_config_impl(ctx):
    deps = []

    base_tsconfig_src = None
    base = ctx.attr.base

    # Gather all base tsconfig files and the exemption list.
    if base:
        if TsConfigInfo not in base:
            fail("`base` must be a ts_config target")
        deps.extend(base[TsConfigInfo].deps)
        base_tsconfig_src = ctx.attr.base.files.to_list()[0]

    out = ctx.outputs.out
    ts_target = ctx.attr.target
    generated_tsconfig_content = _generate_tsconfig(
        ctx.bin_dir.path,
        ts_target,
        base_tsconfig_src,
        ctx.attr.use_runfiles,
    )

    ctx.actions.write(output = out, content = generated_tsconfig_content)

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
        "base": attr.label(
            allow_single_file = [".json"],
            doc = """Base tsconfig to extend from.""",
        ),
        "use_runfiles": attr.bool(mandatory = True),
        "out": attr.output(mandatory = True),
    },
    doc = """Generate the tsconfig.json for a tsec_test. """,
)

def _all_transitive_deps_impl(ctx):
    if TsecTargetInfo not in ctx.attr.target:
        fail("`target` must be a ts_library target")

    tslib_info = ctx.attr.target[TsecTargetInfo]

    files = []
    for s in tslib_info.srcs:
        if hasattr(s, "files"):
            files.extend(s.files.to_list())

    files.extend(tslib_info.deps.to_list())

    return [DefaultInfo(files = depset(files))]

_all_transitive_deps = rule(
    implementation = _all_transitive_deps_impl,
    attrs = {"target": attr.label(aspects = [_capture_tsec_attrs_aspect])},
    doc = """Expand all transitive dependencies needed to run `_tsec_test`.""",
)

def tsec_test(name, target, tsconfig, use_runfiles_on_windows = False):
    """Run tsec over a ts_library or ng_module target to check its compatibility with Trusted Types.

    This rule DOES NOT check transitive dependencies.
    Args:
        name: name of the tsec test
        target: the ts_library or ng_module target to be checked
        tsconfig: the ts_config target used for configuring tsec
        use_runfiles_on_windows: whether to force using runfiles on Windows
    """
    tsec_tsconfig_name = "%s_tsec_tsconfig" % name
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
        base = tsconfig,
        use_runfiles = use_runfiles,
        out = generated_tsconfig,
    )

    all_transitive_deps_name = "%s_all_transitive_deps" % name
    _all_transitive_deps(
        name = all_transitive_deps_name,
        testonly = True,
        tags = ["tsec"],
        target = target,
    )

    nodejs_test(
        name = name,
        entry_point = Label("@npm//:node_modules/tsec/bin/tsec"),
        data = [Label("@npm//tsec"), tsec_tsconfig_name, all_transitive_deps_name, generated_tsconfig],
        tags = ["tsec"],
        templated_args = ["-p", "$$(rlocation $(rootpath %s))" % generated_tsconfig],
    )
