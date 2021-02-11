# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Package Angular libraries for npm distribution

If all users of an Angular library use Bazel (e.g. internal usage in your company)
then you should simply add your library to the `deps` of the consuming application.

These rules exist for compatibility with non-Bazel consumers of your library.

It packages your library following the Angular Package Format, see the
specification of this format at https://goo.gl/jB3GVv
"""

load("@build_bazel_rules_nodejs//:providers.bzl", "JSEcmaScriptModuleInfo", "JSNamedModuleInfo", "NodeContextInfo", "NpmPackageInfo", "node_modules_aspect")
load(
    "@build_bazel_rules_nodejs//internal/pkg_npm:pkg_npm.bzl",
    "PKG_NPM_ATTRS",
    "PKG_NPM_OUTPUTS",
    "create_package",
)
load("//packages/bazel/src:external.bzl", "FLAT_DTS_FILE_SUFFIX")
load("//packages/bazel/src/ng_package:collect-type-definitions.bzl", "collect_type_definitions")

# Prints a debug message if "--define=VERBOSE_LOGS=true" is specified.
def _debug(vars, *args):
    if "VERBOSE_LOGS" in vars.keys():
        print("[ng_package.bzl]", args)

_DEFAULT_NG_PACKAGER = "//@angular/bazel/bin:packager"
_DEFAULT_ROLLUP_CONFIG_TMPL = "//:node_modules/@angular/bazel/src/ng_package/rollup.config.js"
_DEFALUT_TERSER_CONFIG_FILE = "//:node_modules/@angular/bazel/src/ng_package/terser_config.default.json"
_DEFAULT_ROLLUP = "//@angular/bazel/src/ng_package:rollup_for_ng_package"
_DEFAULT_TERSER = (
    # BEGIN-DEV-ONLY
    "@npm" +
    # END-DEV-ONLY
    "//terser/bin:terser"
)

_NG_PACKAGE_MODULE_MAPPINGS_ATTR = "ng_package_module_mappings"

def _ng_package_module_mappings_aspect_impl(target, ctx):
    mappings = dict()
    for dep in ctx.rule.attr.deps:
        if hasattr(dep, _NG_PACKAGE_MODULE_MAPPINGS_ATTR):
            for k, v in getattr(dep, _NG_PACKAGE_MODULE_MAPPINGS_ATTR).items():
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
    return struct(ng_package_module_mappings = mappings)

ng_package_module_mappings_aspect = aspect(
    _ng_package_module_mappings_aspect_impl,
    attr_aspects = ["deps"],
)

# Convert from some-dash-case to someCamelCase
def _convert_dash_case_to_camel_case(s):
    parts = s.split("-")

    # First letter in the result is always unchanged
    return s[0] + "".join([p.capitalize() for p in parts])[1:]

# Convert from a package name on npm to an identifier that's a legal global symbol
#  @angular/core -> ng.core
#  @angular/platform-browser-dynamic/testing -> ng.platformBrowserDynamic.testing
def _global_name(package_name):
    # strip npm scoped package qualifier
    start = 1 if package_name.startswith("@") else 0
    parts = package_name[start:].split("/")
    result_parts = []
    for p in parts:
        # Special case for angular's short name
        if p == "angular":
            result_parts.append("ng")
        else:
            result_parts.append(_convert_dash_case_to_camel_case(p))
    return ".".join(result_parts)

WELL_KNOWN_GLOBALS = {p: _global_name(p) for p in [
    "@angular/upgrade",
    "@angular/upgrade/static",
    "@angular/forms",
    "@angular/core/testing",
    "@angular/core",
    "@angular/platform-server/init",
    "@angular/platform-server/testing",
    "@angular/platform-server",
    "@angular/common/testing",
    "@angular/common",
    "@angular/common/http/testing",
    "@angular/common/http",
    "@angular/elements",
    "@angular/platform-browser-dynamic/testing",
    "@angular/platform-browser-dynamic",
    "@angular/compiler/testing",
    "@angular/compiler",
    "@angular/animations",
    "@angular/animations/browser/testing",
    "@angular/animations/browser",
    "@angular/service-worker/config",
    "@angular/service-worker",
    "@angular/platform-browser/testing",
    "@angular/platform-browser",
    "@angular/platform-browser/animations",
    "@angular/router/upgrade",
    "@angular/router/testing",
    "@angular/router",
    "rxjs",
    "rxjs/operators",
]}

# skydoc fails with type(depset()) so using "depset" here instead
# TODO(gregmagolan): clean this up
_DEPSET_TYPE = "depset"

def _terser(ctx, input, output):
    """Runs terser on an input file.

    Args:
      ctx: Bazel rule execution context
      input: input file
      output: output file

    Returns:
      The sourcemap file
    """

    map_output = ctx.actions.declare_file(output.basename + ".map", sibling = output)

    args = ctx.actions.args()

    args.add(input.path)
    args.add_all(["--output", output.path])

    # Source mapping options are comma-packed into one argv
    # see https://github.com/terser-js/terser#command-line-usage
    source_map_opts = ["includeSources", "base=" + ctx.bin_dir.path]

    # This option doesn't work in the config file, only on the CLI
    args.add_all(["--source-map", ",".join(source_map_opts)])

    args.add("--comments")

    args.add_all(["--config-file", ctx.file.terser_config_file.path])

    ctx.actions.run(
        progress_message = "Optimizing JavaScript %s [terser]" % output.short_path,
        executable = ctx.executable.terser,
        inputs = [input, ctx.file.terser_config_file],
        outputs = [output, map_output],
        arguments = [args],
    )

    return map_output

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

def _write_rollup_config(
        ctx,
        root_dir,
        filename = "_%s.rollup.conf.js",
        include_tslib = False,
        downlevel_to_es5 = False):
    """Generate a rollup config file.

    Args:
      ctx: Bazel rule execution context
      root_dir: root directory for module resolution (defaults to None)
      filename: output filename pattern (defaults to `_%s.rollup.conf.js`)

    Returns:
      The rollup config file. See https://rollupjs.org/guide/en#configuration-files
    """
    config = ctx.actions.declare_file(filename % ctx.label.name)

    mappings = dict()
    all_deps = ctx.attr.deps + ctx.attr.srcs
    for dep in all_deps:
        if hasattr(dep, _NG_PACKAGE_MODULE_MAPPINGS_ATTR):
            for k, v in getattr(dep, _NG_PACKAGE_MODULE_MAPPINGS_ATTR).items():
                if k in mappings and mappings[k] != v:
                    fail(("duplicate module mapping at %s: %s maps to both %s and %s" %
                          (dep.label, k, mappings[k], v)), "deps")
                mappings[k] = v

    globals = dict(WELL_KNOWN_GLOBALS, **ctx.attr.globals)
    external = globals.keys()
    if not include_tslib:
        external.append("tslib")

    # Whether the --stamp flag is applied in the context of the action's execution.
    stamp = ctx.attr.node_context_data[NodeContextInfo].stamp

    # Pass external & globals through a templated config file because on Windows there is
    # an argument limit and we there might be a lot of globals which need to be passed to
    # rollup.

    ctx.actions.expand_template(
        output = config,
        template = ctx.file.rollup_config_tmpl,
        substitutions = {
            "TMPL_banner_file": "\"%s\"" % ctx.file.license_banner.path if ctx.file.license_banner else "undefined",
            "TMPL_module_mappings": str(mappings),
            "TMPL_node_modules_root": _compute_node_modules_root(ctx),
            "TMPL_root_dir": root_dir,
            "TMPL_stamp_data": "\"%s\"" % ctx.version_file.path if (stamp and ctx.version_file) else "undefined",
            "TMPL_workspace_name": ctx.workspace_name,
            "TMPL_external": ", ".join(["'%s'" % e for e in external]),
            "TMPL_globals": ", ".join(["'%s': '%s'" % g for g in globals.items()]),
            "TMPL_downlevel_to_es5": "true" if downlevel_to_es5 else "false",
        },
    )

    return config

def _run_rollup(ctx, bundle_name, rollup_config, entry_point, inputs, js_output, format, module_name = ""):
    map_output = ctx.actions.declare_file(js_output.basename + ".map", sibling = js_output)

    args = ctx.actions.args()
    args.add("--input", entry_point)
    args.add("--config", rollup_config)
    args.add("--output.file", js_output)
    args.add("--output.format", format)
    if module_name:
        args.add("--output.name", _global_name(module_name))
        args.add("--amd.id", module_name)
    elif format == "umd" or format == "iife":
        # If we're generating UMD or IIFE we need a global name.
        # See https://risanb.com/posts/bundling-your-javascript-library-with-rollup/#umd-output and
        # https://risanb.com/posts/bundling-your-javascript-library-with-rollup/#umd-output.
        args.add("--output.name", ctx.label.name)

    # After updating to build_bazel_rules_nodejs 0.27.0+, rollup has been updated to v1.3.1
    # which tree shakes @__PURE__ annotations and const variables which are later amended by NGCC.
    # We turn this feature off for ng_package as Angular bundles contain these and there are
    # test failures if they are removed.
    # See comments in:
    # https://github.com/angular/angular/pull/29210
    # https://github.com/angular/angular/pull/32069
    args.add("--no-treeshake")

    # Note: if the input has external source maps then we need to also install and use
    #   `rollup-plugin-sourcemaps`, which will require us to use rollup.config.js file instead
    #   of command line args
    args.add("--sourcemap")

    args.add("--preserveSymlinks")

    # We will produce errors as needed. Anything else is spammy: a well-behaved
    # bazel rule prints nothing on success.
    args.add("--silent")

    # Whether the --stamp flag is applied in the context of the action's execution.
    stamp = ctx.attr.node_context_data[NodeContextInfo].stamp

    other_inputs = [rollup_config]
    if ctx.file.license_banner:
        other_inputs.append(ctx.file.license_banner)
    if stamp and ctx.version_file:
        other_inputs.append(ctx.version_file)
    ctx.actions.run(
        progress_message = "ng_package: Rollup %s %s" % (bundle_name, ctx.label),
        mnemonic = "AngularPackageRollup",
        inputs = inputs.to_list() + other_inputs,
        outputs = [js_output, map_output],
        executable = ctx.executable.rollup,
        tools = [ctx.executable.rollup],
        arguments = [args],
    )
    return struct(
        js = js_output,
        map = map_output,
    )

# convert from [{js: js_file1, map: map_file1}, ...] to
# [js_filepath1, map_filepath1, ...]
def _flatten_paths(directory):
    result = []
    for f in directory:
        result.append(f.js.path)
        if f.map:
            result.append(f.map.path)
    return result

# Takes a depset of files and returns a depset that doesn't contain any generated files by NGC.
# Optionally can filter out files that do not belong to a specified package path.
def _filter_out_generated_files(files, extension, package_path = None):
    result = []
    files_list = files.to_list() if type(files) == _DEPSET_TYPE else files
    for file in files_list:
        # If the "package_path" parameter has been specified, filter out files
        # that do not start with the specified package path.
        if package_path and not file.short_path.startswith(package_path):
            continue

        # Filter out files that are generated by the Angular Compiler CLI.
        if (not (file.path.endswith(".ngfactory.%s" % extension) or
                 file.path.endswith(".ngsummary.%s" % extension) or
                 file.path.endswith(".ngstyle.%s" % extension))):
            result.append(file)

    return depset(result)

def _filter_js_inputs(all_inputs):
    all_inputs_list = all_inputs.to_list() if type(all_inputs) == _DEPSET_TYPE else all_inputs
    return [
        f
        for f in all_inputs_list
        if f.path.endswith(".js") or f.path.endswith(".json")
    ]

# ng_package produces package that is npm-ready.
def _ng_package_impl(ctx):
    npm_package_directory = ctx.actions.declare_directory("%s.ng_pkg" % ctx.label.name)

    esm_2015_files_depsets = []
    for dep in ctx.attr.deps:
        if JSEcmaScriptModuleInfo in dep:
            esm_2015_files_depsets.append(dep[JSEcmaScriptModuleInfo].sources)

    esm_2015_files = _filter_out_generated_files(depset(transitive = esm_2015_files_depsets), "mjs")

    # These accumulators match the directory names where the files live in the
    # Angular package format.
    fesm2015 = []
    esm2015 = []
    bundles = []
    bundled_type_definitions = []
    type_definitions = []

    # Collect all prodmode esm2015 source files which should be copied into the
    # `esm2015` folder according to Angular Package Format v10.
    for f in esm_2015_files.to_list():
        # tsickle generated `{module}.externs.js` file will be added to JSEcmaScriptModuleInfo sources
        # by ng_module so we include both .js and .mjs sources from the JSEcmaScriptModuleInfo provider
        if f.path.endswith(".js") or f.path.endswith(".mjs"):
            esm2015.append(struct(js = f, map = None))

    # We infer the entry points to be:
    # - ng_module rules in the deps (they have an "angular" provider)
    # - in this package or a subpackage
    # - those that have a module_name attribute (they produce flat module metadata)
    collected_entry_points = []

    deps_in_package = [d for d in ctx.attr.deps if d.label.package.startswith(ctx.label.package)]
    for dep in deps_in_package:
        # Module name of the current entry-point. eg. @angular/core/testing
        module_name = ""

        # Intentionally evaluates to empty string for the main entry point
        entry_point = dep.label.package[len(ctx.label.package) + 1:]

        # Extract the "module_name" from either "ts_library" or "ng_module". Both
        # set the "module_name" in the provider struct.
        if hasattr(dep, "module_name"):
            module_name = dep.module_name

        if hasattr(dep, "angular") and hasattr(dep.angular, "flat_module_metadata"):
            # For dependencies which are built using the "ng_module" with flat module bundles
            # enabled, we determine the module name, the flat module index file, the metadata
            # file and the typings entry point from the flat module metadata which is set by
            # the "ng_module" rule.
            ng_module_metadata = dep.angular.flat_module_metadata
            module_name = ng_module_metadata.module_name
            index_file = ng_module_metadata.flat_module_out_file + ".js"
            typings_path = ng_module_metadata.typings_file.path
            metadata_file = ng_module_metadata.metadata_file
            guessed_paths = False
            _debug(
                ctx.var,
                "entry-point %s is built using a flat module bundle." % dep,
                "using %s as main file of the entry-point" % index_file,
            )
        else:
            # In case the dependency is built through the "ts_library" rule, or the "ng_module"
            # rule does not generate a flat module bundle, we determine the index file and
            # typings entry-point through the most reasonable defaults (i.e. "package/index").
            output_dir = "/".join([
                p
                for p in [
                    ctx.bin_dir.path,
                    ctx.label.package,
                    entry_point,
                ]
                if p
            ])

            # fallback to a reasonable default
            index_file = "index.js"
            typings_path = "%s/index.d.ts" % output_dir
            metadata_file = None
            guessed_paths = True
            _debug(
                ctx.var,
                "entry-point %s does not have flat module metadata." % dep,
                "guessing %s as main file of the entry-point" % index_file,
            )

        # Store the collected entry point in a list of all entry-points. This
        # can be later passed to the packager as a manifest.
        collected_entry_points.append(struct(
            module_name = module_name,
            typings_path = typings_path,
            metadata_file = metadata_file,
            guessed_paths = guessed_paths,
        ))

        if hasattr(dep, "dts_bundles"):
            bundled_type_definitions += dep.dts_bundles
        elif len(type_definitions) == 0:
            # Filter out all TypeScript definitions generated by NGC as well as definition files
            # that do not belong to the current package. We only want to package types that belong
            # to the current package.
            type_definitions = _filter_out_generated_files(
                collect_type_definitions(ctx),
                "d.ts",
                ctx.label.package,
            ).to_list()

        if len(type_definitions) > 0 and len(bundled_type_definitions) > 0:
            # bundle_dts needs to be enabled/disabled for all entry points.
            fail("Expected all or none of the entry points to have 'bundle_dts' enabled.")

        es2015_entry_point = "/".join([p for p in [
            ctx.bin_dir.path,
            ctx.label.package,
            entry_point,
            index_file.replace(".js", ".mjs"),
        ] if p])

        if entry_point:
            # TODO jasonaden says there is no particular reason these filenames differ
            prefix = primary_entry_point_name(ctx.attr.name, ctx.attr.entry_point, ctx.attr.entry_point_name)
            umd_output_filename = "-".join([prefix] + entry_point.split("/"))
            fesm_output_filename = entry_point.replace("/", "__")
            fesm2015_output = ctx.actions.declare_file("fesm2015/%s.js" % fesm_output_filename)
            umd_output = ctx.actions.declare_file("%s.umd.js" % umd_output_filename)
            min_output = ctx.actions.declare_file("%s.umd.min.js" % umd_output_filename)
        else:
            fesm2015_output = ctx.outputs.fesm2015
            umd_output = ctx.outputs.umd
            min_output = ctx.outputs.umd_min

        # Also include files from npm fine grained deps as inputs.
        # These deps are identified by the NpmPackageInfo provider.
        node_modules_files = []
        for d in ctx.attr.deps:
            if NpmPackageInfo in d:
                node_modules_files += _filter_js_inputs(d.files)

        esm2015_rollup_inputs = depset(node_modules_files, transitive = [esm_2015_files])
        esm2015_config = _write_rollup_config(ctx, ctx.bin_dir.path, filename = "_%s.rollup_esm2015.conf.js")
        umd_config = _write_rollup_config(
            ctx,
            ctx.bin_dir.path,
            filename = "_%s.rollup_umd.conf.js",
            include_tslib = True,
            downlevel_to_es5 = True,
        )

        fesm2015.append(
            _run_rollup(
                ctx,
                "fesm2015",
                esm2015_config,
                es2015_entry_point,
                esm2015_rollup_inputs,
                fesm2015_output,
                format = "esm",
            ),
        )

        bundles.append(
            _run_rollup(
                ctx,
                "umd",
                umd_config,
                es2015_entry_point,
                esm2015_rollup_inputs,
                umd_output,
                module_name = module_name,
                format = "umd",
            ),
        )

        terser_sourcemap = _terser(
            ctx,
            umd_output,
            min_output,
        )
        bundles.append(struct(js = min_output, map = terser_sourcemap))

    packager_inputs = (
        ctx.files.srcs +
        ctx.files.data +
        type_definitions +
        bundled_type_definitions +
        [f.js for f in fesm2015 + esm2015 + bundles] +
        [f.map for f in fesm2015 + esm2015 + bundles if f.map]
    )

    packager_args = ctx.actions.args()
    packager_args.use_param_file("%s", use_always = True)

    # The order of arguments matters here, as they are read in order in packager.ts.
    packager_args.add(npm_package_directory.path)
    packager_args.add(ctx.label.package)
    packager_args.add_joined([ctx.bin_dir.path, ctx.label.package], join_with = "/")
    packager_args.add_joined([ctx.genfiles_dir.path, ctx.label.package], join_with = "/")

    # Marshal the metadata into a JSON string so we can parse the data structure
    # in the TypeScript program easily.
    metadata_arg = {}
    for m in collected_entry_points:
        if m.metadata_file:
            packager_inputs.extend([m.metadata_file])
        metadata_arg[m.module_name] = {
            "index": m.typings_path.replace(".d.ts", ".js"),
            "typings": m.typings_path,
            # Metadata can be undefined if entry point is built with "ts_library".
            "metadata": m.metadata_file.path if m.metadata_file else "",
            # If the paths for that entry-point were guessed (e.g. "ts_library" rule or
            # "ng_module" without flat module bundle), we pass this information to the packager.
            "guessedPaths": "true" if m.guessed_paths else "",
        }
    packager_args.add(str(metadata_arg))

    if ctx.file.readme_md:
        packager_inputs.append(ctx.file.readme_md)
        packager_args.add(ctx.file.readme_md.path)
    else:
        # placeholder
        packager_args.add("")

    packager_args.add_joined(_flatten_paths(fesm2015), join_with = ",", omit_if_empty = False)
    packager_args.add_joined(_flatten_paths(esm2015), join_with = ",", omit_if_empty = False)
    packager_args.add_joined(_flatten_paths(bundles), join_with = ",", omit_if_empty = False)
    packager_args.add_joined([s.path for s in ctx.files.srcs], join_with = ",", omit_if_empty = False)
    packager_args.add_joined([s.path for s in type_definitions], join_with = ",", omit_if_empty = False)

    # TODO: figure out a better way to gather runfiles providers from the transitive closure.
    packager_args.add_joined([d.path for d in ctx.files.data], join_with = ",", omit_if_empty = False)

    if ctx.file.license_banner:
        packager_inputs.append(ctx.file.license_banner)
        packager_args.add(ctx.file.license_banner)
    else:
        # placeholder
        packager_args.add("")

    packager_args.add_joined([d.path for d in bundled_type_definitions], join_with = ",", omit_if_empty = False)
    packager_args.add(FLAT_DTS_FILE_SUFFIX)

    ctx.actions.run(
        progress_message = "Angular Packaging: building npm package %s" % str(ctx.label),
        mnemonic = "AngularPackage",
        inputs = packager_inputs,
        outputs = [npm_package_directory],
        executable = ctx.executable.ng_packager,
        arguments = [packager_args],
    )

    devfiles = depset()
    if ctx.attr.include_devmode_srcs:
        for dep in ctx.attr.deps:
            if JSNamedModuleInfo in dep:
                devfiles = depset(transitive = [devfiles, dep[JSNamedModuleInfo].sources])

    # Re-use the create_package function from the nodejs npm_package rule.
    package_dir = create_package(
        ctx,
        devfiles.to_list(),
        [npm_package_directory] + ctx.files.nested_packages,
    )
    return [DefaultInfo(
        files = depset([package_dir]),
    )]

_NG_PACKAGE_DEPS_ASPECTS = [ng_package_module_mappings_aspect, node_modules_aspect]

_NG_PACKAGE_ATTRS = dict(PKG_NPM_ATTRS, **{
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
        ng_package(
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

        ng_package(
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

        ng_package(
            name = "bundle",
            entry_point = ":entry_file",
        )
        ```
        """,
        mandatory = True,
        allow_single_file = True,
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
    "deps": attr.label_list(
        doc = """Other rules that produce JavaScript outputs, such as `ts_library`.""",
        aspects = _NG_PACKAGE_DEPS_ASPECTS,
    ),
    "data": attr.label_list(
        doc = "Additional, non-Angular files to be added to the package, e.g. global CSS assets.",
        allow_files = True,
    ),
    "include_devmode_srcs": attr.bool(default = False),
    "readme_md": attr.label(allow_single_file = [".md"]),
    "entry_point_name": attr.string(
        doc = "Name to use when generating bundle files for the primary entry-point.",
    ),
    "ng_packager": attr.label(
        default = Label(_DEFAULT_NG_PACKAGER),
        executable = True,
        cfg = "host",
    ),
    "rollup": attr.label(
        default = Label(_DEFAULT_ROLLUP),
        executable = True,
        cfg = "host",
    ),
    "terser": attr.label(
        executable = True,
        cfg = "host",
        default = Label(_DEFAULT_TERSER),
    ),
    "terser_config_file": attr.label(
        doc = """A JSON file containing Terser minify() options.

This is the file you would pass to the --config-file argument in terser's CLI.
https://github.com/terser-js/terser#minify-options documents the content of the file.

If `config_file` isn't supplied, Bazel will use a default config file.
""",
        allow_single_file = True,
        # These defaults match how terser was run in the legacy built-in rollup_bundle rule.
        # We keep them the same so it's easier for users to migrate.
        default = Label(_DEFALUT_TERSER_CONFIG_FILE),
    ),
    "rollup_config_tmpl": attr.label(
        default = Label(_DEFAULT_ROLLUP_CONFIG_TMPL),
        allow_single_file = True,
    ),
})

# Angular wants these named after the entry_point,
# eg. for //packages/core it looks like "packages/core/index.js", we want
# core.js produced by this rule.
# Currently we just borrow the entry point for this, if it looks like
# some/path/to/my/package/index.js
# we assume the files should be named "package.*.js"
def primary_entry_point_name(name, entry_point, entry_point_name):
    """This is not a public API.

    Compute the name of the primary entry point in the library.

    Args:
      name: the name of the `ng_package` rule, as a fallback.
      entry_point: The starting point of the application, see rollup_bundle.
      entry_point_name: if set, this is the returned value.

    Returns:
      name of the entry point, which will appear in the name of generated bundles
    """
    if (type(entry_point) == "Target"):
        ep = entry_point.label
    elif (type(entry_point) == "Label"):
        ep = entry_point
    else:
        fail("entry_point should be a Target or Label but got %s" % type(entry_point))

    if entry_point_name:
        # If an explicit entry_point_name is given, use that.
        return entry_point_name
    elif ep.package.find("/") >= 0:
        # If the entry_point package has multiple path segments, use the last one.
        # E.g., for "//packages/angular/cdk:a11y", use "cdk".
        return ep.package.split("/")[-1]
    else:
        # Fall back to the name of the ng_package rule.
        return name

def _ng_package_outputs(name, entry_point, entry_point_name):
    """This is not a public API.

    This function computes the named outputs for an ng_package rule.

    Args:
      name: value of the name attribute
      entry_point: value of the entry_point attribute
      entry_point_name: value of the entry_point_name attribute

    Returns:
      dict of named outputs of the rule
    """

    basename = primary_entry_point_name(name, entry_point, entry_point_name)
    outputs = {
        "fesm2015": "fesm2015/%s.js" % basename,
        "umd": "%s.umd.js" % basename,
        "umd_min": "%s.umd.min.js" % basename,
    }
    for key in PKG_NPM_OUTPUTS:
        # PKG_NPM_OUTPUTS is a "normal" dict-valued outputs so it looks like
        #  "pack": "%{name}.pack",
        # But this is a function-valued outputs.
        # Bazel won't replace the %{name} token so we have to do it.
        outputs[key] = PKG_NPM_OUTPUTS[key].replace("%{name}", name)
    return outputs

ng_package = rule(
    implementation = _ng_package_impl,
    attrs = _NG_PACKAGE_ATTRS,
    outputs = _ng_package_outputs,
)
"""
ng_package produces an npm-ready package from an Angular library.
"""

def ng_package_macro(name, **kwargs):
    ng_package(
        name = name,
        **kwargs
    )
    native.alias(
        name = name + ".pack",
        actual = select({
            "@bazel_tools//src/conditions:host_windows": name + ".pack.bat",
            "//conditions:default": name + ".pack.sh",
        }),
    )
    native.alias(
        name = name + ".publish",
        actual = select({
            "@bazel_tools//src/conditions:host_windows": name + ".publish.bat",
            "//conditions:default": name + ".publish.sh",
        }),
    )
