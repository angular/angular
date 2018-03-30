# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""This provides a variant of rollup_bundle that works better for language service.
"""

load("@build_bazel_rules_nodejs//internal/rollup:rollup_bundle.bzl",
    "rollup_module_mappings_aspect",
    "ROLLUP_ATTRS",
    "ROLLUP_OUTPUTS",
    "write_rollup_config",
    "run_rollup")
load("//packages/bazel/src:esm5.bzl", "esm5_outputs_aspect", "ESM5Info")

PACKAGES=["core", "common"]
PLUGIN_CONFIG="{sideEffectFreeModules: [\n%s]}" % ",\n".join(
    ["        'packages/{0}/{0}.esm5'".fgit sormat(p) for p in PACKAGES])
BO_ROLLUP="angular_devkit/packages/angular_devkit/build_optimizer/src/build-optimizer/rollup-plugin.js"
BO_PLUGIN="require('%s').default(%s)" % (BO_ROLLUP, PLUGIN_CONFIG)

def _ls_rollup_bundle(ctx):
  # We don't expect anyone to make use of this bundle yet, but it makes this rule
  # compatible with rollup_bundle which allows them to be easily swapped back and
  # forth.
  rollup_config = ctx.file.rollup_config

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

  run_rollup(ctx, depset(transitive = esm5_sources).to_list(), rollup_config, ctx.outputs.build_es5)

  return DefaultInfo(files=depset([ctx.outputs.build_es5]))

ls_rollup_bundle = rule(
    implementation = _ls_rollup_bundle,
    attrs = dict(ROLLUP_ATTRS, **{
        "rollup_config": attr.label(mandatory=True, allow_single_file = True),
        "deps": attr.label_list(aspects = [
            rollup_module_mappings_aspect,
            esm5_outputs_aspect,
        ])}),
    outputs = {
        "build_es5": "%{name}.js",
    },
)
