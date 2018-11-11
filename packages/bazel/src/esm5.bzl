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

    # Workaround for https://github.com/bazelbuild/rules_typescript/issues/211
    # TODO(gmagolan): generate esm5 output from ts_proto_library and have that
    # output work with esm5_outputs_aspect
    if not hasattr(target.typescript, "replay_params"):
        print("WARNING: no esm5 output from target %s//%s:%s available" % (target.label.workspace_root, target.label.package, target.label.name))
        return []

    # We create a new tsconfig.json file that will have our compilation settings
    tsconfig = ctx.actions.declare_file("%s_esm5.tsconfig.json" % target.label.name)

    workspace = target.label.workspace_root if target.label.workspace_root else ""

    # re-root the outputs under a ".esm5" directory so the path don't collide
    out_dir = ctx.label.name + ".esm5"
    if workspace:
        out_dir = out_dir + "/" + workspace

    outputs = [
        ctx.actions.declare_file(_join([out_dir, _map_closure_path(f)]))
        for f in target.typescript.replay_params.outputs
        if not f.short_path.endswith(".externs.js")
    ]

    ctx.actions.run(
        executable = ctx.executable._modify_tsconfig,
        inputs = [target.typescript.replay_params.tsconfig],
        outputs = [tsconfig],
        arguments = [
            target.typescript.replay_params.tsconfig.path,
            tsconfig.path,
            _join([workspace, target.label.package, ctx.label.name + ".esm5"]),
            ctx.bin_dir.path,
        ],
    )

    replay_compiler = target.typescript.replay_params.compiler.path.split("/")[-1]

    # in windows replay_compiler path end with '.exe'
    if replay_compiler.startswith("tsc_wrapped"):
        compiler = ctx.executable._tsc_wrapped
    elif replay_compiler.startswith("ngc-wrapped"):
        compiler = ctx.executable._ngc_wrapped
    else:
        fail("Unknown replay compiler", target.typescript.replay_params.compiler.path)

    ctx.actions.run(
        progress_message = "Compiling TypeScript (ES5 with ES Modules) %s" % target.label,
        inputs = target.typescript.replay_params.inputs + [tsconfig],
        outputs = outputs,
        arguments = [tsconfig.path],
        executable = compiler,
        execution_requirements = {
            # TODO(alexeagle): enable worker mode for these compilations
            "supports-workers": "0",
        },
        mnemonic = "ESM5",
    )

    root_dir = _join([
        ctx.bin_dir.path,
        workspace,
        target.label.package,
        ctx.label.name + ".esm5",
    ])

    transitive_output = {root_dir: depset(outputs)}
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
    attr_aspects = ["deps"],
    attrs = {
        "_modify_tsconfig": attr.label(
            default = Label("//packages/bazel/src:modify_tsconfig"),
            executable = True,
            cfg = "host",
        ),
        "_tsc_wrapped": attr.label(
            default = Label("@build_bazel_rules_typescript//:@bazel/typescript/tsc_wrapped"),
            executable = True,
            cfg = "host",
        ),
        "_ngc_wrapped": attr.label(
            default = Label("//packages/bazel/src/ngc-wrapped"),
            executable = True,
            cfg = "host",
        ),
    },
)

def esm5_root_dir(ctx):
    return ctx.label.name + ".esm5"

def flatten_esm5(ctx):
    """Merge together the .esm5 folders from the dependencies.

    Two different dependencies A and B may have outputs like
    `bazel-bin/path/to/A.esm5/path/to/lib.js`
    `bazel-bin/path/to/B.esm5/path/to/main.js`

    In order to run rollup on this app, in case main.js contains `import from './lib'`
    they need to be together in the same root directory, so if we depend on both A and B
    we need the outputs to be
    `bazel-bin/path/to/my_rule.esm5/path/to/lib.js`
    `bazel-bin/path/to/my_rule.esm5/path/to/main.js`

    Args:
      ctx: the skylark rule execution context

    Returns:
      list of flattened files
    """
    esm5_sources = []
    result = []
    for dep in ctx.attr.deps:
        if ESM5Info in dep:
            transitive_output = dep[ESM5Info].transitive_output
            esm5_sources.extend(transitive_output.values())
    for f in depset(transitive = esm5_sources).to_list():
        path = f.short_path[f.short_path.find(".esm5") + len(".esm5"):]
        if (path.startswith("../")):
            path = "external/" + path[3:]
        rerooted_file = ctx.actions.declare_file("/".join([esm5_root_dir(ctx), path]))
        result.append(rerooted_file)

        # print("copy", f.short_path, "to", rerooted_file.short_path)
        ctx.actions.expand_template(
            output = rerooted_file,
            template = f,
            substitutions = {},
        )
    return result
