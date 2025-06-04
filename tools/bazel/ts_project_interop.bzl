load("@aspect_rules_js//js:providers.bzl", "JsInfo", "js_info")
load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "JSEcmaScriptModuleInfo", "JSModuleInfo", "LinkablePackageInfo")
load("@devinfra//bazel/ts_project:index.bzl", "strict_deps_test")
load("@rules_angular//src/ts_project:index.bzl", _ts_project = "ts_project")

def _ts_deps_interop_impl(ctx):
    types = []
    sources = []
    runfiles = ctx.runfiles(files = [])
    for dep in ctx.attr.deps:
        if not DeclarationInfo in dep:
            fail("Expected target with DeclarationInfo: %s", dep)
        types.append(dep[DeclarationInfo].transitive_declarations)
        if not JSModuleInfo in dep:
            fail("Expected target with JSModuleInfo: %s", dep)
        sources.append(dep[JSModuleInfo].sources)
        if not DefaultInfo in dep:
            fail("Expected target with DefaultInfo: %s", dep)
        runfiles = runfiles.merge(dep[DefaultInfo].default_runfiles)

    return [
        DefaultInfo(runfiles = runfiles),
        ## NOTE: We don't need to propagate module mappings FORTUNATELY!
        # because rules_nodejs supports tsconfig path mapping, given that
        # everything is nicely compiled from `bazel-bin/`!
        js_info(
            target = ctx.label,
            transitive_types = depset(transitive = types),
            transitive_sources = depset(transitive = sources),
        ),
    ]

ts_deps_interop = rule(
    implementation = _ts_deps_interop_impl,
    attrs = {
        "deps": attr.label_list(providers = [DeclarationInfo], mandatory = True),
    },
)

def _ts_project_module_impl(ctx):
    # Forward runfiles. e.g. JSON files on `ts_project#data`. The jasmine
    # consuming rules may rely on this, or the linker due to its symlinks then.
    runfiles = ctx.attr.dep[DefaultInfo].default_runfiles
    info = ctx.attr.dep[JsInfo]

    # Filter runfiles to not include `node_modules` from Aspect as this interop
    # target is supposed to be used downstream by `rules_nodejs` consumers,
    # and mixing pnpm-style node modules with linker node modules is incompatible.
    filtered_runfiles = []
    for f in runfiles.files.to_list():
        if f.short_path.startswith("node_modules/"):
            continue
        filtered_runfiles.append(f)
    runfiles = ctx.runfiles(files = filtered_runfiles)

    providers = [
        DefaultInfo(
            runfiles = runfiles,
        ),
        JSModuleInfo(
            direct_sources = info.sources,
            sources = depset(transitive = [info.transitive_sources]),
        ),
        JSEcmaScriptModuleInfo(
            direct_sources = info.sources,
            sources = depset(transitive = [info.transitive_sources]),
        ),
        DeclarationInfo(
            declarations = _filter_types_depset(info.types),
            transitive_declarations = _filter_types_depset(info.transitive_types),
            type_blocklisted_declarations = depset(),
        ),
    ]

    if ctx.attr.module_name:
        providers.append(
            LinkablePackageInfo(
                package_name = ctx.attr.module_name,
                package_path = "",
                path = "%s/%s" % (ctx.bin_dir.path, ctx.label.package),
                files = info.sources,
            ),
        )

    return providers

ts_project_module = rule(
    implementation = _ts_project_module_impl,
    attrs = {
        "dep": attr.label(providers = [JsInfo], mandatory = True),
        # Noop attribute for aspect propagation of the linker interop deps; so
        # that transitive linker dependencies are discovered.
        "deps": attr.label_list(),
        # Note: The module aspect from consuming `ts_library` targets will
        # consume the module mappings automatically.
        "module_name": attr.string(),
        "module_root": attr.string(),
    },
)

def ts_project(
        name,
        module_name = None,
        deps = [],
        interop_deps = [],
        tsconfig = None,
        testonly = False,
        visibility = None,
        # TODO: Enable this for all `ts_project` targets at end of migration.
        ignore_strict_deps = True,
        enable_runtime_rnjs_interop = True,
        rule_impl = _ts_project,
        **kwargs):
    # Pull in the `rules_nodejs` variants of dependencies we know are "hybrid". This
    # is necessary as we can't mix `npm/node_modules` from RNJS with the pnpm-style
    # symlink-dependent node modules. In addition, we need to extract `_rjs` interop
    # dependencies so that we can forward and capture the module mappings for runtime
    # execution, with regards to first-party dependency linking.
    rjs_modules_to_rnjs = []
    if enable_runtime_rnjs_interop:
        for d in deps:
            if d.startswith("//:node_modules/"):
                rjs_modules_to_rnjs.append(d.replace("//:node_modules/", "@npm//"))
            if d.endswith("_rjs"):
                rjs_modules_to_rnjs.append(d.replace("_rjs", ""))

    ts_deps_interop(
        name = "%s_interop_deps" % name,
        deps = [] + interop_deps + rjs_modules_to_rnjs,
        visibility = visibility,
        testonly = testonly,
    )

    rule_impl(
        name = "%s_rjs" % name,
        testonly = testonly,
        declaration = True,
        tsconfig = tsconfig,
        visibility = visibility,
        deps = [":%s_interop_deps" % name] + deps,
        **kwargs
    )

    if not ignore_strict_deps:
        strict_deps_test(
            name = "%s_strict_deps_test" % name,
            srcs = kwargs.get("srcs", []),
            deps = deps,
        )

    ts_project_module(
        name = name,
        testonly = testonly,
        visibility = visibility,
        dep = "%s_rjs" % name,
        # Forwarded dependencies for linker module mapping aspect.
        # RJS deps can also transitively pull in module mappings from their `interop_deps`.
        deps = [] + ["%s_interop_deps" % name] + deps,
        module_name = module_name,
    )

# Filter type provider to not include `.json` files. `ts_config`
# targets are included in `ts_project` and their tsconfig json file
# is included as type. See:
# https://github.com/aspect-build/rules_ts/blob/main/ts/private/ts_config.bzl#L55C63-L55C68.
def _filter_types_depset(types_depset):
    types = []

    for t in types_depset.to_list():
        if t.short_path.endswith(".json"):
            continue
        types.append(t)

    return depset(types)
