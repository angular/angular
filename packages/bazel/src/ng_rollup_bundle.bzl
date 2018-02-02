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
    "run_uglify")
load("@build_bazel_rules_nodejs//internal:collect_es6_sources.bzl", collect_es2015_sources = "collect_es6_sources")
load(":esm5.bzl", "esm5_outputs_aspect", "ESM5Info")

PACKAGES=["core", "common"]
PLUGIN_CONFIG="{sideEffectFreeModules: [\n%s]}" % ",\n".join(
    ["        'packages/{0}/{0}.esm5'".format(p) for p in PACKAGES])
BO_ROLLUP="angular_devkit/packages/angular_devkit/build_optimizer/src/build-optimizer/rollup-plugin.js"
BO_PLUGIN="require('%s').default(%s)" % (BO_ROLLUP, PLUGIN_CONFIG)

def _ng_rollup_bundle(ctx):
  # We don't expect anyone to make use of this bundle yet, but it makes this rule
  # compatible with rollup_bundle which allows them to be easily swapped back and
  # forth.
  esm2015_rollup_config = write_rollup_config(ctx, filename = "_%s.rollup_es6.conf.js")
  run_rollup(ctx, collect_es2015_sources(ctx), esm2015_rollup_config, ctx.outputs.build_es6)

  esm5_sources = []
  root_dirs = []

  for dep in ctx.attr.deps:
    if ESM5Info in dep:
      # TODO(alexeagle): we could make the module resolution in the rollup plugin
      # faster if we kept the files grouped with their root dir. This approach just
      # passes in both lists and requires multiple lookups (with expensive exception
      # handling) to locate the files again.
      transitive_output = dep[ESM5Info].transitive_output
      root_dirs.extend(transitive_output.keys())
      esm5_sources.extend(transitive_output.values())

  rollup_config = write_rollup_config(ctx, [BO_PLUGIN], root_dirs)
  run_rollup(ctx, depset(transitive = esm5_sources).to_list(), rollup_config, ctx.outputs.build_es5)

  run_uglify(ctx, ctx.outputs.build_es5, ctx.outputs.build_es5_min)
  run_uglify(ctx, ctx.outputs.build_es5, ctx.outputs.build_es5_min_debug, debug = True)

  return DefaultInfo(files=depset([ctx.outputs.build_es5_min]))

ng_rollup_bundle = rule(
    implementation = _ng_rollup_bundle,
    attrs = dict(ROLLUP_ATTRS, **{
        "deps": attr.label_list(aspects = [
            rollup_module_mappings_aspect,
            esm5_outputs_aspect,
        ]),
        "_rollup": attr.label(
            executable = True,
            cfg="host",
            default = Label("@angular//packages/bazel/src:rollup_with_build_optimizer")),
    }),
    outputs = ROLLUP_OUTPUTS,
)