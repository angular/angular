"""Bazel rules and macros for running tsec over a ng_module or ts_library."""

load("@npm//@bazel/typescript/internal:ts_config.bzl", "TsConfigInfo")
load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo")
load("@npm//tsec:index.bzl", _tsec_test = "tsec_test")

TsecTsconfigInfo = provider(fields = ["src", "exemption", "deps"])

def _tsec_config_impl(ctx):
    deps = []

    # Gather all extended tsconfig files.
    if ctx.files.deps:
        deps.extend(ctx.files.deps)

    for d in ctx.attr.deps:
        # Gather all files from extended ts_config targets.
        if TsConfigInfo in d:
            deps.extend(d[TsConfigInfo].deps)

        # Gather all files from extended tsec_config targets.
        if TsecTsconfigInfo in d:
            deps.append(d[TsecTsconfigInfo].src)
            if d[TsecTsconfigInfo].exemption:
                deps.append(d[TsecTsconfigInfo].exemption)
            deps.extend(d[TsecTsconfigInfo].deps)
    src = ctx.file.src
    return [
        # We need $(rootpath tsec_config_target) to get the path
        # of the top-level config file as the argument for tsec
        # binary. Only `src` should be stored in the DefaultInfo
        # provider.
        DefaultInfo(files = depset([src])),
        TsecTsconfigInfo(
            src = src,
            exemption = ctx.file.exemption,
            deps = deps,
        ),
    ]

tsec_config = rule(
    implementation = _tsec_config_impl,
    attrs = {
        "src": attr.label(
            mandatory = True,
            allow_single_file = [".json"],
            doc = """The single tsconfig used for running tsec.""",
        ),
        "deps": attr.label_list(
            allow_files = [".json"],
            doc = """Any configs extended by `src`.""",
        ),
        "exemption": attr.label(
            allow_single_file = [".json"],
            doc = """The exemption list used by `src`.""",
        ),
    },
    doc = """Compute all transitive dependencies of a tsec_test config. """,
)

TsLibInfo = provider(fields = ["srcs", "deps"])

def _ts_library_forwarded_impl(ctx):
    """Forward `srcs` and `deps` of `ts_library` and `ng_module` macros to `_tsec_test`."""
    return [TsLibInfo(srcs = ctx.attr.srcs, deps = ctx.attr.deps)]

ts_library_forwarded = rule(
    implementation = _ts_library_forwarded_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = [".ts", ".tsx"]),
        "deps": attr.label_list(),
    },
    doc = """A rule-in-the-middle to forward `srcs` and `deps` to _src_and_deps, to avoid repeating these arguments in tsec_test.

Should only be used by the `ts_library` and `ng_module` macros in tools/default.bzel.""",
)

def get_forwarded_target_name(name):
    return "%s_forwarded" % name

def _all_transitive_deps_impl(ctx):
    files = []

    if TsecTsconfigInfo not in ctx.attr.tsconfig:
        fail("`tsconfig` must be a tsec_config target")

    tsec_tsconfig_info = ctx.attr.tsconfig[TsecTsconfigInfo]
    files.append(tsec_tsconfig_info.src)
    if tsec_tsconfig_info.exemption:
        files.append(tsec_tsconfig_info.exemption)
    files.extend(tsec_tsconfig_info.deps)

    if TsLibInfo not in ctx.attr.forwarded_ts_target:
        fail("`target` must be a ts_library_forwarded target")

    ts_target_info = ctx.attr.forwarded_ts_target[TsLibInfo]
    for s in ts_target_info.srcs:
        if hasattr(s, "files"):
            files.extend(s.files.to_list())

    for d in ts_target_info.deps:
        if DeclarationInfo in d:
            files.extend(d[DeclarationInfo].transitive_declarations.to_list())
        if hasattr(d, "files"):
            files.extend(d.files.to_list())

    return [DefaultInfo(files = depset(files))]

_all_transitive_deps = rule(
    implementation = _all_transitive_deps_impl,
    attrs = {
        "tsconfig": attr.label(),
        "forwarded_ts_target": attr.label(),
    },
    doc = """Expand all transitive dependencies needed to run `_tsec_test`.""",
)

def tsec_test(name, target, tsconfig):
    """Run tsec over a ts_library or ng_module target to check its compatibility with Trusted Types.

    This rule DOES NOT check transitive dependencies.

    Args:
        name: name of the tsec test
        target: the ts_library or ng_module target to be checked
        tsconfig: the tsec_config target used for configuring tsec
    """
    all_transitive_deps_name = "%s_all_transitive_deps" % name

    _all_transitive_deps(
        name = all_transitive_deps_name,
        testonly = True,
        tsconfig = tsconfig,
        forwarded_ts_target = get_forwarded_target_name(target),
        tags = ["tsec"],
    )

    _tsec_test(
        name = name,
        data = [tsconfig, all_transitive_deps_name],
        tags = ["tsec"],
        templated_args = ["-p", "$(rootpath %s)" % tsconfig],
    )
