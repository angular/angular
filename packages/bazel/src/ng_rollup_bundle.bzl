# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""Rollup with Build Optimizer

   This provides a variant of the [rollup_bundle] rule that works better for Angular apps.

   It registers `@angular-devkit/build-optimizer` as a rollup plugin, to get
   better optimization. It also uses ESM5 format inputs, as this is what
   build-optimizer is hard-coded to look for and transform.

   [rollup_bundle]: https://bazelbuild.github.io/rules_nodejs/rollup/rollup_bundle.html
"""

load(
    "@build_bazel_rules_nodejs//internal/rollup:rollup_bundle.bzl",
    "ROLLUP_ATTRS",
    "ROLLUP_DEPS_ASPECTS",
    "ROLLUP_OUTPUTS",
    "run_rollup",
    "run_sourcemapexplorer",
    "run_uglify",
    "write_rollup_config",
)
load("@build_bazel_rules_nodejs//internal:collect_es6_sources.bzl", collect_es2015_sources = "collect_es6_sources")
load(":esm5.bzl", "esm5_outputs_aspect", "esm5_root_dir", "flatten_esm5")

PACKAGES = ["packages/core/src", "packages/common/src", "packages/compiler/src", "external/rxjs"]
PLUGIN_CONFIG = "{sideEffectFreeModules: [\n%s]}" % ",\n".join(
    ["        '.esm5/{0}'".format(p) for p in PACKAGES],
)
BO_ROLLUP = "angular_cli/packages/angular_devkit/build_optimizer/src/build-optimizer/rollup-plugin.js"
BO_PLUGIN = "require('%s').default(%s)" % (BO_ROLLUP, PLUGIN_CONFIG)

def _use_plain_rollup(ctx):
    """Determine whether to use the Angular or upstream versions of the rollup_bundle rule.

    In most modes, the Angular version of rollup is used. This runs build optimizer as part of its
    processing, which affects decorators and annotations.

    In JIT modes, an emulation of the upstream rollup_bundle rule is used. This avoids running
    build optimizer on code which isn't designed to be optimized by it.

    Args:
      ctx: skylark rule execution context

    Returns:
      true iff the Angular version of rollup with build optimizer should be used, false otherwise
    """

    if "compile" not in ctx.var:
        return False

    strategy = ctx.var["compile"]
    return strategy == "jit"

def run_brotli(ctx, input, output):
    """Execute the Brotli compression utility.

    Args:
      ctx: Bazel's rule execution context
      input: any file
      output: the compressed file
    """
    ctx.actions.run(
        executable = ctx.executable._brotli,
        inputs = [input],
        outputs = [output],
        arguments = ["--output=%s" % output.path, input.path],
    )

# Borrowed from bazelbuild/rules_nodejs
def _run_tsc(ctx, input, output):
    args = ctx.actions.args()
    args.add("--target", "es5")
    args.add("--allowJS")
    args.add(input)
    args.add("--outFile", output)

    ctx.action(
        executable = ctx.executable._tsc,
        inputs = [input],
        outputs = [output],
        arguments = [args],
    )

# Borrowed from bazelbuild/rules_nodejs, with the addition of brotli compression output
def _plain_rollup_bundle(ctx):
    rollup_config = write_rollup_config(ctx)
    run_rollup(ctx, collect_es2015_sources(ctx), rollup_config, ctx.outputs.build_es6)
    _run_tsc(ctx, ctx.outputs.build_es6, ctx.outputs.build_es5)
    source_map = run_uglify(ctx, ctx.outputs.build_es5, ctx.outputs.build_es5_min)
    run_uglify(ctx, ctx.outputs.build_es5, ctx.outputs.build_es5_min_debug, debug = True)
    umd_rollup_config = write_rollup_config(ctx, filename = "_%s_umd.rollup.conf.js", output_format = "umd")
    run_rollup(ctx, collect_es2015_sources(ctx), umd_rollup_config, ctx.outputs.build_umd)
    run_sourcemapexplorer(ctx, ctx.outputs.build_es5_min, source_map, ctx.outputs.explore_html)

    run_brotli(ctx, ctx.outputs.build_es5_min, ctx.outputs.build_es5_min_compressed)
    files = [ctx.outputs.build_es5_min, source_map]
    return DefaultInfo(files = depset(files), runfiles = ctx.runfiles(files))

def _ng_rollup_bundle(ctx):
    # Escape and use the plain rollup rule if the compilation strategy requires it
    if _use_plain_rollup(ctx):
        return _plain_rollup_bundle(ctx)

    # We don't expect anyone to make use of this bundle yet, but it makes this rule
    # compatible with rollup_bundle which allows them to be easily swapped back and
    # forth.
    esm2015_rollup_config = write_rollup_config(ctx, filename = "_%s.rollup_es6.conf.js")
    run_rollup(ctx, collect_es2015_sources(ctx), esm2015_rollup_config, ctx.outputs.build_es6)

    esm5_sources = flatten_esm5(ctx)

    rollup_config = write_rollup_config(ctx, [BO_PLUGIN], "/".join([ctx.bin_dir.path, ctx.label.package, esm5_root_dir(ctx)]))
    rollup_sourcemap = run_rollup(ctx, esm5_sources, rollup_config, ctx.outputs.build_es5)

    sourcemap = run_uglify(
        ctx,
        ctx.outputs.build_es5,
        ctx.outputs.build_es5_min,
        comments = False,
        in_source_map = rollup_sourcemap,
    )
    run_uglify(
        ctx,
        ctx.outputs.build_es5,
        ctx.outputs.build_es5_min_debug,
        debug = True,
        comments = False,
    )

    umd_rollup_config = write_rollup_config(ctx, filename = "_%s_umd.rollup.conf.js", output_format = "umd")
    run_rollup(ctx, collect_es2015_sources(ctx), umd_rollup_config, ctx.outputs.build_umd)

    run_brotli(ctx, ctx.outputs.build_es5_min, ctx.outputs.build_es5_min_compressed)

    run_sourcemapexplorer(ctx, ctx.outputs.build_es5_min, sourcemap, ctx.outputs.explore_html)

    return DefaultInfo(files = depset([ctx.outputs.build_es5_min, sourcemap]))

DEPS_ASPECTS = [esm5_outputs_aspect]

# Workaround skydoc bug which assumes ROLLUP_DEPS_ASPECTS is a str type
[DEPS_ASPECTS.append(a) for a in ROLLUP_DEPS_ASPECTS]

ng_rollup_bundle = rule(
    implementation = _ng_rollup_bundle,
    attrs = dict(ROLLUP_ATTRS, **{
        "deps": attr.label_list(
            doc = """Other targets that provide JavaScript files.
            Typically this will be `ts_library` or `ng_module` targets.""",
            aspects = DEPS_ASPECTS,
        ),
        "_rollup": attr.label(
            executable = True,
            cfg = "host",
            default = Label("@angular//packages/bazel/src:rollup_with_build_optimizer"),
        ),
        "_brotli": attr.label(
            executable = True,
            cfg = "host",
            default = Label("@org_brotli//:brotli"),
        ),
    }),
    outputs = dict(ROLLUP_OUTPUTS, **{
        "build_es5_min_compressed": "%{name}.min.js.br",
    }),
)
"""
Run [Rollup] with the [Build Optimizer] plugin.

This rule extends from the [rollup_bundle] rule, so attributes and outputs of
that rule are used here too.

[Rollup]: https://rollupjs.org/
[Build Optimizer]: https://www.npmjs.com/package/@angular-devkit/build-optimizer
[rollup_bundle]: https://bazelbuild.github.io/rules_nodejs/rollup/rollup_bundle.html
"""
