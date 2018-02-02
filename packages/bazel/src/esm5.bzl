# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""Provides ES5 syntax with ESModule import/exports.

This exposes another flavor of output JavaScript, which is ES5 syntax
with ES2015 module syntax (import/export).
All Bazel rules should consume the standard dev or prod mode.
However we need to publish this flavor on NPM, so it's necessary to be able
to produce it.
"""

# The provider downstream rules use to access the outputs
ESM5Info = provider(
    doc = "Typescript compilation outputs in ES5 syntax with ES Modules",
    fields = {
        "transitive_output": """Dict of [rootDir, .js depset] entries.

        The value is a depset of the .js output files.
        The key is the prefix that should be stripped off the files
        when resolving modules, eg. for file
          bazel-bin/[external/wkspc/]path/to/package/label.esm5/path/to/package/file.js
        the rootdir would be
          bazel-bin/[external/wkspc/]path/to/package/label.esm5""",
    },
)

def _map_closure_path(file):
  result = file.short_path[:-len(".closure.js")]
  # short_path is meant to be used when accessing runfiles in a binary, where
  # the CWD is inside the current repo. Therefore files in external repo have a
  # short_path of ../external/wkspc/path/to/package
  # We want to strip the first two segments from such paths.
  if (result.startswith("../")):
    result = "/".join(result.split("/")[2:])
  return result + ".js"

def _join(array):
  return "/".join([p for p in array if p])

def _esm5_outputs_aspect(target, ctx):
  if not hasattr(target, "typescript"):
    return []

  # We create a new tsconfig.json file that will have our compilation settings
  tsconfig = ctx.actions.declare_file("%s_esm5.tsconfig.json" % target.label.name)

  workspace = target.label.workspace_root if target.label.workspace_root else ""

  # re-root the outputs under a ".esm5" directory so the path don't collide
  out_dir = ctx.label.name + ".esm5"
  if workspace:
    out_dir = out_dir + "/" + workspace

  outputs = [ctx.actions.declare_file(_join([out_dir, _map_closure_path(f)]))
             for f in target.typescript.replay_params.outputs
             if not f.short_path.endswith(".externs.js")]

  ctx.actions.run(
      executable = ctx.executable._modify_tsconfig,
      inputs = [target.typescript.replay_params.tsconfig],
      outputs = [tsconfig],
      arguments = [
          target.typescript.replay_params.tsconfig.path,
          tsconfig.path,
          _join([workspace, target.label.package, ctx.label.name + ".esm5"]),
          ctx.bin_dir.path
      ],
  )

  ctx.action(
      progress_message = "Compiling TypeScript (ES5 with ES Modules) %s" % target.label,
      inputs = target.typescript.replay_params.inputs + [tsconfig],
      outputs = outputs,
      arguments = [tsconfig.path],
      executable = target.typescript.replay_params.compiler,
      execution_requirements = {
          "supports-workers": "0",
      },
  )

  root_dir = _join([
      ctx.bin_dir.path,
      workspace,
      target.label.package,
      ctx.label.name + ".esm5",
  ])

  transitive_output={root_dir: depset(outputs)}
  for dep in ctx.rule.attr.deps:
    if ESM5Info in dep:
      transitive_output.update(dep[ESM5Info].transitive_output)

  return [ESM5Info(
    transitive_output = transitive_output,
  )]

# Downstream rules can use this aspect to access the ESM5 output flavor.
# Only terminal rules (those which expect never to be used in deps[]) should do
# this.
esm5_outputs_aspect = aspect(
    implementation = _esm5_outputs_aspect,
    # Recurse to the deps of any target we visit
    attr_aspects = ['deps'],
    attrs = {
        "_modify_tsconfig": attr.label(
            default = Label("//packages/bazel/src:modify_tsconfig"),
            executable = True,
            cfg = "host"),
        # We must list tsc_wrapped here to ensure it's built before the action runs
        # For some reason, having the compiler output as an input to the action above
        # is not sufficient.
        "_tsc_wrapped": attr.label(
            default = Label("@build_bazel_rules_typescript//internal/tsc_wrapped:tsc_wrapped_bin"),
            executable = True,
            cfg = "host",
        ),
        # Same comment as for tsc_wrapped above.
        "_ngc_wrapped": attr.label(
            default = Label("//packages/bazel/src/ngc-wrapped"),
            executable = True,
            cfg = "host",
        ),
    },
)
