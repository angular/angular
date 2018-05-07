# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""This provides a variant of rollup_bundle that works better for Angular apps.

   It registers @angular-devkit/build-optimizer as a rollup plugin, to get
   better optimization. It also uses ESM5 format inputs, as this is what
   build-optimizer is hard-coded to look for and transform.
"""

load("@build_bazel_rules_nodejs//internal/rollup:rollup_bundle.bzl",
    "rollup_module_mappings_aspect",
    "ROLLUP_ATTRS",
    "ROLLUP_OUTPUTS",
    "write_rollup_config",
    "run_rollup",
    "run_uglify",
    "run_sourcemapexplorer")
load("@build_bazel_rules_nodejs//internal:collect_es6_sources.bzl", collect_es2015_sources = "collect_es6_sources")
load(":esm5.bzl", "esm5_outputs_aspect", "flatten_esm5", "esm5_root_dir")

PACKAGES=["packages/core/src", "packages/common/src", "external/rxjs"]
PLUGIN_CONFIG="{sideEffectFreeModules: [\n%s]}" % ",\n".join(
    ["        '.esm5/{0}'".format(p) for p in PACKAGES])
BO_ROLLUP="angular_devkit/packages/angular_devkit/build_optimizer/src/build-optimizer/rollup-plugin.js"
BO_PLUGIN="require('%s').default(%s)" % (BO_ROLLUP, PLUGIN_CONFIG)

def run_brotli(ctx, input, output):
  ctx.actions.run(
      executable = ctx.executable._brotli,
      inputs = [input],
      outputs = [output],
      arguments = ["--output=%s" % output.path, input.path],
  )

def _ng_rollup_bundle(ctx):
  # We don't expect anyone to make use of this bundle yet, but it makes this rule
  # compatible with rollup_bundle which allows them to be easily swapped back and
  # forth.
  esm2015_rollup_config = write_rollup_config(ctx, filename = "_%s.rollup_es6.conf.js")
  run_rollup(ctx, collect_es2015_sources(ctx), esm2015_rollup_config, ctx.outputs.build_es6)

  esm5_sources = flatten_esm5(ctx)

  rollup_config = write_rollup_config(ctx, [BO_PLUGIN], "/".join([ctx.bin_dir.path, ctx.label.package, esm5_root_dir(ctx)]))
  rollup_sourcemap = run_rollup(ctx, esm5_sources, rollup_config, ctx.outputs.build_es5)

  sourcemap = run_uglify(ctx,
      ctx.outputs.build_es5,
      ctx.outputs.build_es5_min,
      comments = False,
      in_source_map = rollup_sourcemap)
  run_uglify(ctx,
      ctx.outputs.build_es5,
      ctx.outputs.build_es5_min_debug,
      debug = True, comments = False)

  umd_rollup_config = write_rollup_config(ctx, filename = "_%s_umd.rollup.conf.js", output_format = "umd")
  run_rollup(ctx, collect_es2015_sources(ctx), umd_rollup_config, ctx.outputs.build_umd)

  run_brotli(ctx, ctx.outputs.build_es5_min, ctx.outputs.build_es5_min_compressed)

  run_sourcemapexplorer(ctx, ctx.outputs.build_es5_min, sourcemap, ctx.outputs.explore_html)

  return DefaultInfo(files=depset([ctx.outputs.build_es5_min, sourcemap]))

ng_rollup_bundle = rule(
    implementation = _ng_rollup_bundle,
    attrs = dict(ROLLUP_ATTRS, **{
        "deps": attr.label_list(aspects = [
            rollup_module_mappings_aspect,
            esm5_outputs_aspect,
        ]),
        "_rollup": attr.label(
            executable = True,
            cfg = "host",
            default = Label("@angular//packages/bazel/src:rollup_with_build_optimizer")),
        "_brotli": attr.label(
            executable = True,
            cfg = "host",
            default = Label("@org_brotli//:brotli")),
    }),
    outputs = dict(ROLLUP_OUTPUTS, **{
        "build_es5_min_compressed": "%{name}.min.js.br",
    }),
)
