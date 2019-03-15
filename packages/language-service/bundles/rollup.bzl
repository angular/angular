"""Custom rollup_bundle for language service.

Overrides format to AMD and produces only umd and min, no FESM.

We do this so that we bundle all of the dependencies into the bundle
except for typescript, fs and path.

This allows editors and other tools to easily use the language service bundle
without having to provide all of the angular specific peer dependencies.
"""

load(
    "@build_bazel_rules_nodejs//internal/rollup:rollup_bundle.bzl",
    "ROLLUP_ATTRS",
    "ROLLUP_DEPS_ASPECTS",
    "run_rollup",
    "run_terser",
    "write_rollup_config",
)
load("//packages/bazel/src:esm5.bzl", "esm5_outputs_aspect", "esm5_root_dir", "flatten_esm5")

# Note: the file is called "umd.js" and "umd.min.js" because of historical
# reasons. The format is actually amd and not umd, but we are afraid to rename
# the file because that would likely break the IDE and other integrations that
# have the path hardcoded in them.
_ROLLUP_OUTPUTS = {
    "build_umd": "%{name}.umd.js",
    "build_umd_min": "%{name}.umd.min.js",
}

DEPS_ASPECTS = [esm5_outputs_aspect]

# Workaround skydoc bug which assumes ROLLUP_DEPS_ASPECTS is a str type
[DEPS_ASPECTS.append(a) for a in ROLLUP_DEPS_ASPECTS]

def _ls_rollup_bundle(ctx):
    esm5_sources = flatten_esm5(ctx)
    rollup_config = write_rollup_config(
        ctx,
        root_dir = "/".join([ctx.bin_dir.path, ctx.label.package, esm5_root_dir(ctx)]),
        output_format = "amd",
    )
    run_rollup(ctx, esm5_sources, rollup_config, ctx.outputs.build_umd)
    source_map = run_terser(ctx, ctx.outputs.build_umd, ctx.outputs.build_umd_min)
    return DefaultInfo(files = depset([ctx.outputs.build_umd, ctx.outputs.build_umd_min, source_map]))

ls_rollup_bundle = rule(
    implementation = _ls_rollup_bundle,
    attrs = dict(ROLLUP_ATTRS, **{
        "deps": attr.label_list(
            doc = """Other targets that provide JavaScript files.
            Typically this will be `ts_library` or `ng_module` targets.""",
            aspects = DEPS_ASPECTS,
        ),
    }),
    outputs = _ROLLUP_OUTPUTS,
)
