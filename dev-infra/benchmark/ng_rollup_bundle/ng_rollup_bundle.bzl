# Copyright Google LLC All Rights Reserved.
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

load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@build_bazel_rules_nodejs//:providers.bzl", "JSEcmaScriptModuleInfo", "NpmPackageInfo", "node_modules_aspect")
load("//packages/bazel/src:esm5.bzl", "esm5_outputs_aspect", "esm5_root_dir", "flatten_esm5")
load("@npm_bazel_terser//:index.bzl", "terser_minified")

_NG_ROLLUP_BUNDLE_OUTPUTS = {
    "bundle": "%{name}.js",
    "sourcemap": "%{name}.js.map",
}

_NG_ROLLUP_MODULE_MAPPINGS_ATTR = "ng_rollup_module_mappings"

def _ng_rollup_module_mappings_aspect_impl(target, ctx):
    mappings = dict()
    for dep in ctx.rule.attr.deps:
        if hasattr(dep, _NG_ROLLUP_MODULE_MAPPINGS_ATTR):
            for k, v in getattr(dep, _NG_ROLLUP_MODULE_MAPPINGS_ATTR).items():
                if k in mappings and mappings[k] != v:
                    fail(("duplicate module mapping at %s: %s maps to both %s and %s" %
                          (target.label, k, mappings[k], v)), "deps")
                mappings[k] = v
    if ((hasattr(ctx.rule.attr, "module_name") and ctx.rule.attr.module_name) or
        (hasattr(ctx.rule.attr, "module_root") and ctx.rule.attr.module_root)):
        mn = ctx.rule.attr.module_name
        if not mn:
            mn = target.label.name
        mr = target.label.package
        if target.label.workspace_root:
            mr = "%s/%s" % (target.label.workspace_root, mr)
        if ctx.rule.attr.module_root and ctx.rule.attr.module_root != ".":
            if ctx.rule.attr.module_root.endswith(".ts"):
                # This is the type-checking module mapping. Strip the trailing .d.ts
                # as it doesn't belong in TypeScript's path mapping.
                mr = "%s/%s" % (mr, ctx.rule.attr.module_root.replace(".d.ts", ""))
            else:
                mr = "%s/%s" % (mr, ctx.rule.attr.module_root)
        if mn in mappings and mappings[mn] != mr:
            fail(("duplicate module mapping at %s: %s maps to both %s and %s" %
                  (target.label, mn, mappings[mn], mr)), "deps")
        mappings[mn] = mr
    return struct(ng_rollup_module_mappings = mappings)

ng_rollup_module_mappings_aspect = aspect(
    _ng_rollup_module_mappings_aspect_impl,
    attr_aspects = ["deps"],
)

_NG_ROLLUP_BUNDLE_DEPS_ASPECTS = [esm5_outputs_aspect, ng_rollup_module_mappings_aspect, node_modules_aspect]

_NG_ROLLUP_BUNDLE_ATTRS = {
    "build_optimizer": attr.bool(
        doc = """Use build optimizer plugin

        Only used if sources are esm5 which depends on value of esm5_sources.""",
        default = True,
    ),
    "esm5_sources": attr.bool(
        doc = """Use esm5 input sources""",
        default = True,
    ),
    "srcs": attr.label_list(
        doc = """JavaScript source files from the workspace.
        These can use ES2015 syntax and ES Modules (import/export)""",
        allow_files = True,
    ),
    "entry_point": attr.label(
        doc = """The starting point of the application, passed as the `--input` flag to rollup.

        If the entry JavaScript file belongs to the same package (as the BUILD file),
        you can simply reference it by its relative name to the package directory:

        ```
        ng_rollup_bundle(
            name = "bundle",
            entry_point = ":main.js",
        )
        ```

        You can specify the entry point as a typescript file so long as you also include
        the ts_library target in deps:

        ```
        ts_library(
            name = "main",
            srcs = ["main.ts"],
        )

        ng_rollup_bundle(
            name = "bundle",
            deps = [":main"]
            entry_point = ":main.ts",
        )
        ```

        The rule will use the corresponding `.js` output of the ts_library rule as the entry point.

        If the entry point target is a rule, it should produce a single JavaScript entry file that will be passed to the nodejs_binary rule.
        For example:

        ```
        filegroup(
            name = "entry_file",
            srcs = ["main.js"],
        )

        ng_rollup_bundle(
            name = "bundle",
            entry_point = ":entry_file",
        )
        ```
        """,
        mandatory = True,
        allow_single_file = True,
    ),
    "deps": attr.label_list(
        doc = """Other targets that provide JavaScript files.
        Typically this will be `ts_library` or `ng_module` targets.""",
        aspects = _NG_ROLLUP_BUNDLE_DEPS_ASPECTS,
    ),
    "format": attr.string(
        doc = """"Specifies the format of the generated bundle. One of the following:

- `amd`: Asynchronous Module Definition, used with module loaders like RequireJS
- `cjs`: CommonJS, suitable for Node and other bundlers
- `esm`: Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a `<script type=module>` tag in modern browsers
- `iife`: A self-executing function, suitable for inclusion as a `<script>` tag. (If you want to create a bundle for your application, you probably want to use this.)
- `umd`: Universal Module Definition, works as amd, cjs and iife all in one
- `system`: Native format of the SystemJS loader
""",
        values = ["amd", "cjs", "esm", "iife", "umd", "system"],
        default = "esm",
    ),
    "global_name": attr.string(
        doc = """A name given to this package when referenced as a global variable.
        This name appears in the bundle module incantation at the beginning of the file,
        and governs the global symbol added to the global context (e.g. `window`) as a side-
        effect of loading the UMD/IIFE JS bundle.

        Rollup doc: "The variable name, representing your iife/umd bundle, by which other scripts on the same page can access it."

        This is passed to the `output.name` setting in Rollup.""",
    ),
    "globals": attr.string_dict(
        doc = """A dict of symbols that reference external scripts.
        The keys are variable names that appear in the program,
        and the values are the symbol to reference at runtime in a global context (UMD bundles).
        For example, a program referencing @angular/core should use ng.core
        as the global reference, so Angular users should include the mapping
        `"@angular/core":"ng.core"` in the globals.""",
        default = {},
    ),
    "license_banner": attr.label(
        doc = """A .txt file passed to the `banner` config option of rollup.
        The contents of the file will be copied to the top of the resulting bundles.
        Note that you can replace a version placeholder in the license file, by using
        the special version `0.0.0-PLACEHOLDER`. See the section on stamping in the README.""",
        allow_single_file = [".txt"],
    ),
    "_rollup": attr.label(
        executable = True,
        cfg = "host",
        default = Label("//dev-infra/benchmark/ng_rollup_bundle:rollup_with_build_optimizer"),
    ),
    "_rollup_config_tmpl": attr.label(
        default = Label("//dev-infra/benchmark/ng_rollup_bundle:rollup.config.js"),
        allow_single_file = True,
    ),
}

def _compute_node_modules_root(ctx):
    """Computes the node_modules root from the node_modules and deps attributes.

    Args:
      ctx: the skylark execution context

    Returns:
      The node_modules root as a string
    """
    node_modules_root = None
    for d in ctx.attr.deps:
        if NpmPackageInfo in d:
            possible_root = "/".join(["external", d[NpmPackageInfo].workspace, "node_modules"])
            if not node_modules_root:
                node_modules_root = possible_root
            elif node_modules_root != possible_root:
                fail("All npm dependencies need to come from a single workspace. Found '%s' and '%s'." % (node_modules_root, possible_root))
    if not node_modules_root:
        # there are no fine grained deps but we still need a node_modules_root even if its empty
        node_modules_root = "external/npm/node_modules"
    return node_modules_root

# Avoid using non-normalized paths (workspace/../other_workspace/path)
def _to_manifest_path(ctx, file):
    if file.short_path.startswith("../"):
        return file.short_path[3:]
    else:
        return ctx.workspace_name + "/" + file.short_path

# Expand entry_point into runfiles and strip the file extension
def _esm5_entry_point_path(ctx):
    return _to_manifest_path(ctx, ctx.file.entry_point)[:-(len(ctx.file.entry_point.extension) + 1)]

def _no_ext(f):
    return f.short_path[:-len(f.extension) - 1]

def _resolve_js_input(f, inputs):
    if f.extension == "js" or f.extension == "mjs":
        return f

    # look for corresponding js file in inputs
    no_ext = _no_ext(f)
    for i in inputs:
        if i.extension == "js" or i.extension == "mjs":
            if _no_ext(i) == no_ext:
                return i
    fail("Could not find corresponding javascript entry point for %s. Add the %s.js to your deps." % (f.path, no_ext))

def _write_rollup_config(ctx, root_dir, build_optimizer, filename = "_%s.rollup.conf.js"):
    """Generate a rollup config file.

    Args:
      ctx: Bazel rule execution context
      root_dir: root directory for module resolution
      build_optimizer: whether to enable Build Optimizer plugin
      filename: output filename pattern (defaults to `_%s.rollup.conf.js`)

    Returns:
      The rollup config file. See https://rollupjs.org/guide/en#configuration-files
    """
    config = ctx.actions.declare_file(filename % ctx.label.name)

    mappings = dict()
    all_deps = ctx.attr.deps + ctx.attr.srcs
    for dep in all_deps:
        if hasattr(dep, _NG_ROLLUP_MODULE_MAPPINGS_ATTR):
            for k, v in getattr(dep, _NG_ROLLUP_MODULE_MAPPINGS_ATTR).items():
                if k in mappings and mappings[k] != v:
                    fail(("duplicate module mapping at %s: %s maps to both %s and %s" %
                          (dep.label, k, mappings[k], v)), "deps")
                mappings[k] = v

    globals = {}
    external = []
    if ctx.attr.globals:
        globals = ctx.attr.globals.items()
        external = ctx.attr.globals.keys()

    ctx.actions.expand_template(
        output = config,
        template = ctx.file._rollup_config_tmpl,
        substitutions = {
            "TMPL_banner_file": "\"%s\"" % ctx.file.license_banner.path if ctx.file.license_banner else "undefined",
            "TMPL_build_optimizer": "true" if build_optimizer else "false",
            "TMPL_module_mappings": str(mappings),
            "TMPL_node_modules_root": _compute_node_modules_root(ctx),
            "TMPL_root_dir": root_dir,
            "TMPL_stamp_data": "\"%s\"" % ctx.version_file.path if ctx.version_file else "undefined",
            "TMPL_workspace_name": ctx.workspace_name,
            "TMPL_external": ", ".join(["'%s'" % e for e in external]),
            "TMPL_globals": ", ".join(["'%s': '%s'" % g for g in globals]),
            "TMPL_ivy_enabled": "true" if ctx.var.get("angular_ivy_enabled", None) == "True" else "false",
        },
    )

    return config

def _filter_js_inputs(all_inputs):
    all_inputs_list = all_inputs.to_list() if type(all_inputs) == type(depset()) else all_inputs
    return [
        f
        for f in all_inputs_list
        if f.path.endswith(".js") or f.path.endswith(".mjs") or f.path.endswith(".json")
    ]

def _run_rollup(ctx, entry_point_path, sources, config):
    args = ctx.actions.args()
    args.add("--config", config.path)
    args.add("--input", entry_point_path)
    args.add("--output.file", ctx.outputs.bundle)
    args.add("--output.name", ctx.attr.global_name if ctx.attr.global_name else ctx.label.name)
    args.add("--output.format", ctx.attr.format)
    args.add("--output.sourcemap")
    args.add("--output.sourcemapFile", ctx.outputs.sourcemap)

    # We will produce errors as needed. Anything else is spammy: a well-behaved
    # bazel rule prints nothing on success.
    args.add("--silent")

    args.add("--preserveSymlinks")

    direct_inputs = [config]

    # Also include files from npm fine grained deps as inputs.
    # These deps are identified by the NpmPackageInfo provider.
    for d in ctx.attr.deps:
        if NpmPackageInfo in d:
            # Note: we can't avoid calling .to_list() on sources
            direct_inputs.extend(_filter_js_inputs(d[NpmPackageInfo].sources.to_list()))

    if ctx.file.license_banner:
        direct_inputs.append(ctx.file.license_banner)
    if ctx.version_file:
        direct_inputs.append(ctx.version_file)

    ctx.actions.run(
        progress_message = "Bundling JavaScript %s [rollup]" % ctx.outputs.bundle.short_path,
        executable = ctx.executable._rollup,
        inputs = depset(direct_inputs, transitive = [sources]),
        outputs = [ctx.outputs.bundle, ctx.outputs.sourcemap],
        arguments = [args],
    )

def _ng_rollup_bundle_impl(ctx):
    if ctx.attr.esm5_sources:
        # Use esm5 sources and build optimzier if ctx.attr.build_optimizer is set
        rollup_config = _write_rollup_config(ctx, build_optimizer = ctx.attr.build_optimizer, root_dir = "/".join([ctx.bin_dir.path, ctx.label.package, esm5_root_dir(ctx)]))
        _run_rollup(ctx, _esm5_entry_point_path(ctx), flatten_esm5(ctx), rollup_config)
    else:
        # Use esm2015 sources and no build optimzier
        rollup_config = _write_rollup_config(ctx, build_optimizer = False, root_dir = ctx.bin_dir.path)
        esm2015_files_depsets = []
        for dep in ctx.attr.deps:
            if JSEcmaScriptModuleInfo in dep:
                esm2015_files_depsets.append(dep[JSEcmaScriptModuleInfo].sources)
        esm2015_files = depset(transitive = esm2015_files_depsets)
        entry_point_path = _to_manifest_path(ctx, _resolve_js_input(ctx.file.entry_point, esm2015_files.to_list()))
        _run_rollup(ctx, entry_point_path, esm2015_files, rollup_config)

    return DefaultInfo(files = depset([ctx.outputs.bundle, ctx.outputs.sourcemap]))

_ng_rollup_bundle = rule(
    implementation = _ng_rollup_bundle_impl,
    attrs = _NG_ROLLUP_BUNDLE_ATTRS,
    outputs = _NG_ROLLUP_BUNDLE_OUTPUTS,
)
"""
Run [Rollup] with the [Build Optimizer] plugin and use esm5 inputs.

[Rollup]: https://rollupjs.org/
[Build Optimizer]: https://www.npmjs.com/package/@angular-devkit/build-optimizer
"""

def ng_rollup_bundle(name, **kwargs):
    """Rollup with Build Optimizer on esm5 inputs.

    This provides a variant of the [legacy rollup_bundle] rule that works better for Angular apps.

    Runs [rollup], [terser_minified] and [brotli] to produce a number of output bundles.

    es5                             : "%{name}.js"
    es5 minified                    : "%{name}.min.js"
    es5 minified (compressed)       : "%{name}.min.js.br",
    es5 minified (debug)            : "%{name}.min_debug.js"
    es2015                          : "%{name}.es2015.js"
    es2015 minified                 : "%{name}.min.es2015.js"
    es2015 minified (compressed)    : "%{name}.min.js.es2015.br",
    es2015 minified (debug)         : "%{name}.min_debug.es2015.js"

    It registers `@angular-devkit/build-optimizer` as a rollup plugin, to get
    better optimization. It also uses ESM5 format inputs, as this is what
    build-optimizer is hard-coded to look for and transform.

    [legacy rollup_bundle]: https://github.com/bazelbuild/rules_nodejs/blob/0.38.3/internal/rollup/rollup_bundle.bzl
    [rollup]: https://rollupjs.org/guide/en/
    [terser_minified]: https://bazelbuild.github.io/rules_nodejs/Terser.html
    [brotli]: https://brotli.org/
    """
    format = kwargs.pop("format", "iife")
    build_optimizer = kwargs.pop("build_optimizer", True)
    visibility = kwargs.pop("visibility", None)

    # Common arguments for all terser_minified targets
    common_terser_args = {
        # As of terser 4.3.4 license comments are preserved by default. See
        # https://github.com/terser/terser/blob/master/CHANGELOG.md. We want to
        # maintain the comments off behavior. We pass the --comments flag with
        # a regex that always evaluates to false to do this.
        "args": ["--comments", "/bogus_string_to_suppress_all_comments^/"],
        "config_file": "//dev-infra/benchmark/ng_rollup_bundle:terser_config.json",
        "sourcemap": False,
    }

    # TODO(gregmagolan): reduce this macro to just use the new @bazel/rollup rollup_bundle
    # once esm5 inputs are no longer needed. _ng_rollup_bundle is just here for esm5 support
    # and once that requirement is removed for Angular 10 then there is nothing that rule is doing
    # that the new @bazel/rollup rollup_bundle rule can't do.
    _ng_rollup_bundle(
        name = name,
        build_optimizer = build_optimizer,
        format = format,
        visibility = visibility,
        **kwargs
    )
    terser_minified(name = name + ".min", src = name, visibility = visibility, **common_terser_args)
    native.filegroup(name = name + ".min.js", srcs = [name + ".min"], visibility = visibility)
    terser_minified(name = name + ".min_debug", src = name, debug = True, visibility = visibility, **common_terser_args)
    native.filegroup(name = name + ".min_debug.js", srcs = [name + ".min_debug"], visibility = visibility)
    npm_package_bin(
        name = "_%s_brotli" % name,
        tool = "//dev-infra/benchmark/brotli-cli",
        data = [name + ".min.js"],
        outs = [name + ".min.js.br"],
        args = [
            "--output=$(execpath %s.min.js.br)" % name,
            "$(execpath %s.min.js)" % name,
        ],
        visibility = visibility,
    )

    _ng_rollup_bundle(
        name = name + ".es2015",
        esm5_sources = False,
        format = format,
        visibility = visibility,
        **kwargs
    )
    terser_minified(name = name + ".min.es2015", src = name + ".es2015", visibility = visibility, **common_terser_args)
    native.filegroup(name = name + ".min.es2015.js", srcs = [name + ".min.es2015"], visibility = visibility)
    terser_minified(name = name + ".min_debug.es2015", src = name + ".es2015", debug = True, visibility = visibility, **common_terser_args)
    native.filegroup(name = name + ".min_debug.es2015.js", srcs = [name + ".min_debug.es2015"], visibility = visibility)
    npm_package_bin(
        name = "_%s_es2015_brotli" % name,
        tool = "//dev-infra/benchmark/brotli-cli",
        data = [name + ".min.es2015.js"],
        outs = [name + ".min.es2015.js.br"],
        args = [
            "--output=$(execpath %s.min.es2015.js.br)" % name,
            "$(execpath %s.min.es2015.js)" % name,
        ],
        visibility = visibility,
    )

def ls_rollup_bundle(name, **kwargs):
    """A variant of ng_rollup_bundle for the language-service bundle

    ls_rollup_bundle uses esm5 inputs, outputs AMD and does not use the build optimizer.
    """
    visibility = kwargs.pop("visibility", None)

    # Note: the output file is called "umd.js" because of historical reasons.
    # The format is actually AMD and not UMD, but we are afraid to rename
    # the file because that would likely break the IDE and other integrations that
    # have the path hardcoded in them.
    ng_rollup_bundle(
        name = name + ".umd",
        build_optimizer = False,
        format = "amd",
        visibility = visibility,
        **kwargs
    )
    native.alias(
        name = name,
        actual = name + ".umd",
        visibility = visibility,
    )
