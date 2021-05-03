# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Run Angular's AOT template compiler
"""

load(
    ":external.bzl",
    "BuildSettingInfo",
    "COMMON_ATTRIBUTES",
    "COMMON_OUTPUTS",
    "DEFAULT_API_EXTRACTOR",
    "DEFAULT_NG_COMPILER",
    "DEFAULT_NG_XI18N",
    "DEPS_ASPECTS",
    "LinkablePackageInfo",
    "NpmPackageInfo",
    "TsConfigInfo",
    "compile_ts",
    "js_ecma_script_module_info",
    "js_module_info",
    "js_named_module_info",
    "node_modules_aspect",
    "ts_providers_dict_to_struct",
    "tsc_wrapped_tsconfig",
)

# enable_perf_logging controls whether Ivy's performance tracing system will be enabled for any
# compilation which includes this provider.
NgPerfInfo = provider(fields = ["enable_perf_logging"])

_FLAT_DTS_FILE_SUFFIX = ".bundle.d.ts"
_R3_SYMBOLS_DTS_FILE = "src/r3_symbols.d.ts"

def is_perf_requested(ctx):
    enable_perf_logging = ctx.attr.perf_flag != None and ctx.attr.perf_flag[NgPerfInfo].enable_perf_logging == True
    if enable_perf_logging and not is_ivy_enabled(ctx):
        fail("Angular View Engine does not support performance tracing")
    return enable_perf_logging

def is_ivy_enabled(ctx):
    """Determine if the ivy compiler should be used to by the ng_module.

    Args:
      ctx: skylark rule execution context

    Returns:
      Boolean, Whether the ivy compiler should be used.
    """

    # Check the renderer flag to see if Ivy is enabled.
    # This is intended to support a transition use case for google3 migration.
    # The `_renderer` attribute will never be set externally, but will always be
    # set internally as a `string_flag()` with the allowed values of:
    # "view_engine" or "ivy".
    if ((hasattr(ctx.attr, "_renderer") and
         ctx.attr._renderer[BuildSettingInfo].value == "ivy")):
        return True

    # This attribute is only defined in google's private ng_module rule and not
    # available externally. For external users, this is effectively a no-op.
    if hasattr(ctx.attr, "ivy") and ctx.attr.ivy == True:
        return True

    if ctx.var.get("angular_ivy_enabled", None) == "True":
        return True

    # Enable Angular targets extracted by Kythe Angular indexer to be compiled with the Ivy compiler architecture.
    # TODO(ayazhafiz): remove once Ivy has landed as the default in g3.
    if ctx.var.get("GROK_ELLIPSIS_BUILD", None) != None:
        return True

    # Return false to default to ViewEngine compiler
    return False

def _compiler_name(ctx):
    """Selects a user-visible name depending on the current compilation strategy.

    Args:
      ctx: skylark rule execution context

    Returns:
      The name of the current compiler to be displayed in build output
    """

    return "Ivy" if is_ivy_enabled(ctx) else "ViewEngine"

def _is_view_engine_enabled(ctx):
    """Determines whether Angular outputs will be produced by the current compilation strategy.

    Args:
      ctx: skylark rule execution context

    Returns:
      true iff the current compilation strategy will produce View Engine compilation outputs (such as
      factory files), false otherwise
    """

    return not is_ivy_enabled(ctx)

def _basename_of(ctx, file):
    ext_len = len(".ts")
    if file.short_path.endswith(".ng.html"):
        ext_len = len(".ng.html")
    elif file.short_path.endswith(".html"):
        ext_len = len(".html")
    return file.short_path[len(ctx.label.package) + 1:-ext_len]

# Return true if run with bazel (the open-sourced version of blaze), false if
# run with blaze.
def _is_bazel():
    return not hasattr(native, "genmpm")

def _flat_module_out_file(ctx):
    """Provide a default for the flat_module_out_file attribute.

    We cannot use the default="" parameter of ctx.attr because the value is calculated
    from other attributes (name)

    Args:
      ctx: skylark rule execution context

    Returns:
      a basename used for the flat module out (no extension)
    """
    if getattr(ctx.attr, "flat_module_out_file", False):
        return ctx.attr.flat_module_out_file
    return "%s_public_index" % ctx.label.name

def _should_produce_dts_bundle(ctx):
    """Should we produce dts bundles.

    We only produce flatten dts outs when we expect the ng_module is meant to be published,
    based on the value of the bundle_dts attribute.

    Args:
      ctx: skylark rule execution context

    Returns:
      true when we should produce bundled dts.
    """

    # At the moment we cannot use this with ngtsc compiler since it emits
    # import * as ___ from local modules which is not supported
    # see: https://github.com/Microsoft/web-build-tools/issues/1029
    return _is_view_engine_enabled(ctx) and getattr(ctx.attr, "bundle_dts", False)

def _should_produce_r3_symbols_bundle(ctx):
    """Should we produce r3_symbols bundle.

    NGCC relies on having r3_symbols file. This file is located in @angular/core
    And should only be included when bundling core in legacy mode.

    Args:
      ctx: skylark rule execution context

    Returns:
      true when we should produce r3_symbols dts.
    """

    # iif we are compiling @angular/core with ngc we should add this addition dts bundle
    # because ngcc relies on having this file.
    # see: https://github.com/angular/angular/blob/84406e4d6d93b28b23efbb1701bc5ae1084da67b/packages/compiler-cli/src/ngcc/src/packages/entry_point_bundle.ts#L56
    # todo: alan-agius4: remove when ngcc doesn't need this anymore
    return _is_view_engine_enabled(ctx) and ctx.attr.module_name == "@angular/core"

def _should_produce_flat_module_outs(ctx):
    """Should we produce flat module outputs.

    We only produce flat module outs when we expect the ng_module is meant to be published,
    based on the presence of the module_name attribute.

    Args:
      ctx: skylark rule execution context

    Returns:
      true iff we should run the bundle_index_host to produce flat module metadata and bundle index
    """
    return _is_bazel() and ctx.attr.module_name

# Calculate the expected output of the template compiler for every source in
# in the library. Most of these will be produced as empty files but it is
# unknown, without parsing, which will be empty.
def _expected_outs(ctx):
    is_legacy_ngc = _is_view_engine_enabled(ctx)

    devmode_js_files = []
    closure_js_files = []
    declaration_files = []
    transpilation_infos = []
    summary_files = []
    metadata_files = []

    factory_basename_set = depset([_basename_of(ctx, src) for src in ctx.files.factories])

    for src in ctx.files.srcs + ctx.files.assets:
        package_prefix = ctx.label.package + "/" if ctx.label.package else ""

        # Strip external repository name from path if src is from external repository
        # If src is from external repository, it's short_path will be ../<external_repo_name>/...
        short_path = src.short_path if src.short_path[0:2] != ".." else "/".join(src.short_path.split("/")[2:])

        if short_path.endswith(".ts") and not short_path.endswith(".d.ts"):
            basename = short_path[len(package_prefix):-len(".ts")]
            if (len(factory_basename_set.to_list()) == 0 or basename in factory_basename_set.to_list()):
                if _generate_ve_shims(ctx):
                    devmode_js = [
                        ".ngfactory.js",
                        ".ngsummary.js",
                        ".js",
                    ]
                else:
                    devmode_js = [".js"]

                # Only ngc produces .json files, they're not needed in Ivy.
                if is_legacy_ngc:
                    summaries = [".ngsummary.json"]
                    metadata = [".metadata.json"]
                else:
                    summaries = []
                    metadata = []
            else:
                devmode_js = [".js"]
                if not _is_bazel():
                    devmode_js += [".ngfactory.js"]
                summaries = []
                metadata = []
        elif is_legacy_ngc and short_path.endswith(".css"):
            basename = short_path[len(package_prefix):-len(".css")]
            devmode_js = [
                ".css.shim.ngstyle.js",
                ".css.ngstyle.js",
            ]
            summaries = []
            metadata = []
        else:
            continue

        filter_summaries = ctx.attr.filter_summaries
        declarations = [f.replace(".js", ".d.ts") for f in devmode_js]

        for devmode_ext in devmode_js:
            devmode_js_file = ctx.actions.declare_file(basename + devmode_ext)
            devmode_js_files.append(devmode_js_file)

            if not filter_summaries or not devmode_ext.endswith(".ngsummary.js"):
                closure_ext = devmode_ext.replace(".js", ".mjs")
                closure_js_file = ctx.actions.declare_file(basename + closure_ext)
                closure_js_files.append(closure_js_file)
                transpilation_infos.append(struct(closure = closure_js_file, devmode = devmode_js_file))

        declaration_files += [ctx.actions.declare_file(basename + ext) for ext in declarations]
        summary_files += [ctx.actions.declare_file(basename + ext) for ext in summaries]
        if not _is_bazel():
            metadata_files += [ctx.actions.declare_file(basename + ext) for ext in metadata]

    dts_bundles = None
    if _should_produce_dts_bundle(ctx):
        # We need to add a suffix to bundle as it might collide with the flat module dts.
        # The flat module dts out contains several other exports
        # https://github.com/angular/angular/blob/84406e4d6d93b28b23efbb1701bc5ae1084da67b/packages/compiler-cli/src/metadata/index_writer.ts#L18
        # the file name will be like 'core.bundle.d.ts'
        dts_bundles = [ctx.actions.declare_file(ctx.label.name + _FLAT_DTS_FILE_SUFFIX)]

        if _should_produce_r3_symbols_bundle(ctx):
            dts_bundles.append(ctx.actions.declare_file(_R3_SYMBOLS_DTS_FILE.replace(".d.ts", _FLAT_DTS_FILE_SUFFIX)))

    # We do this just when producing a flat module index for a publishable ng_module
    if _should_produce_flat_module_outs(ctx):
        flat_module_out = _flat_module_out_file(ctx)
        devmode_js_files.append(ctx.actions.declare_file("%s.js" % flat_module_out))
        closure_js_files.append(ctx.actions.declare_file("%s.mjs" % flat_module_out))
        bundle_index_typings = ctx.actions.declare_file("%s.d.ts" % flat_module_out)
        declaration_files.append(bundle_index_typings)
        if is_legacy_ngc:
            metadata_files.append(ctx.actions.declare_file("%s.metadata.json" % flat_module_out))
    else:
        bundle_index_typings = None

    # TODO(alxhub): i18n is only produced by the legacy compiler currently. This should be re-enabled
    # when ngtsc can extract messages
    if is_legacy_ngc and _is_bazel():
        i18n_messages_files = [ctx.actions.declare_file(ctx.label.name + "_ngc_messages.xmb")]
    elif is_legacy_ngc:
        # write the xmb file to blaze-genfiles since that path appears in the translation console keys
        i18n_messages_files = [ctx.new_file(ctx.genfiles_dir, ctx.label.name + "_ngc_messages.xmb")]
    else:
        i18n_messages_files = []

    dev_perf_files = []
    prod_perf_files = []

    # In Ivy mode, dev and prod builds both produce a .json output containing performance metrics
    # from the compiler for that build.
    if is_perf_requested(ctx):
        dev_perf_files = [ctx.actions.declare_file(ctx.label.name + "_perf_dev.json")]
        prod_perf_files = [ctx.actions.declare_file(ctx.label.name + "_perf_prod.json")]

    return struct(
        closure_js = closure_js_files,
        devmode_js = devmode_js_files,
        declarations = declaration_files,
        transpilation_infos = transpilation_infos,
        summaries = summary_files,
        metadata = metadata_files,
        dts_bundles = dts_bundles,
        bundle_index_typings = bundle_index_typings,
        i18n_messages = i18n_messages_files,
        dev_perf_files = dev_perf_files,
        prod_perf_files = prod_perf_files,
    )

# Determines if we need to generate View Engine shims (.ngfactory and .ngsummary files)
def _generate_ve_shims(ctx):
    # we are checking the workspace name here, because otherwise this would be a breaking change
    # (the shims used to be on by default)
    # we can remove this check once angular/components and angular/angular-cli repos no longer depend
    # on the presence of shims, or if they explicitly opt-in to their generation via ng_modules' generate_ve_shims attr
    return _is_bazel() and _is_view_engine_enabled(ctx) or (
        getattr(ctx.attr, "generate_ve_shims", False) == True or ctx.workspace_name != "angular"
    )

def _ngc_tsconfig(ctx, files, srcs, **kwargs):
    generate_ve_shims = _generate_ve_shims(ctx)
    outs = _expected_outs(ctx)
    is_legacy_ngc = _is_view_engine_enabled(ctx)
    if "devmode_manifest" in kwargs:
        expected_outs = outs.devmode_js + outs.declarations + outs.summaries + outs.metadata
    else:
        expected_outs = outs.closure_js

    angular_compiler_options = {
        "enableResourceInlining": ctx.attr.inline_resources,
        "generateCodeForLibraries": False,
        "allowEmptyCodegenFiles": True,
        "generateNgFactoryShims": True if generate_ve_shims else False,
        "generateNgSummaryShims": True if generate_ve_shims else False,
        # Summaries are only enabled if Angular outputs are to be produced.
        "enableSummariesForJit": is_legacy_ngc,
        "enableIvy": is_ivy_enabled(ctx),
        "compilationMode": ctx.attr.compilation_mode,
        "fullTemplateTypeCheck": ctx.attr.type_check,
        # In Google3 we still want to use the symbol factory re-exports in order to
        # not break existing apps inside Google. Unlike Bazel, Google3 does not only
        # enforce strict dependencies of source files, but also for generated files
        # (such as the factory files). Therefore in order to avoid that generated files
        # introduce new module dependencies (which aren't explicitly declared), we need
        # to enable external symbol re-exports by default when running with Blaze.
        "createExternalSymbolFactoryReexports": (not _is_bazel()),
        # FIXME: wrong place to de-dupe
        "expectedOut": depset([o.path for o in expected_outs]).to_list(),
        # We instruct the compiler to use the host for import generation in Blaze. By default,
        # module names between source files of the same compilation unit are relative paths. This
        # is not desired in google3 where the generated module names are used as qualified names
        # for aliased exports. We disable relative paths and always use manifest paths in google3.
        "_useHostForImportGeneration": (not _is_bazel()),
        "_useManifestPathsAsModuleName": (not _is_bazel()),
    }

    if is_perf_requested(ctx):
        # In Ivy mode, set the `tracePerformance` Angular compiler option to enable performance
        # metric output.
        if "devmode_manifest" in kwargs:
            perf_path = outs.dev_perf_files[0].path
        else:
            perf_path = outs.prod_perf_files[0].path
        angular_compiler_options["tracePerformance"] = perf_path

    if _should_produce_flat_module_outs(ctx):
        angular_compiler_options["flatModuleId"] = ctx.attr.module_name
        angular_compiler_options["flatModuleOutFile"] = _flat_module_out_file(ctx)
        angular_compiler_options["flatModulePrivateSymbolPrefix"] = "_".join(
            [ctx.workspace_name] + ctx.label.package.split("/") + [ctx.label.name, ""],
        )

    return dict(tsc_wrapped_tsconfig(ctx, files, srcs, **kwargs), **{
        "angularCompilerOptions": angular_compiler_options,
    })

def _has_target_angular_summaries(target):
    return hasattr(target, "angular") and hasattr(target.angular, "summaries")

def _collect_summaries_aspect_impl(target, ctx):
    results = depset(target.angular.summaries if _has_target_angular_summaries(target) else [])

    # If we are visiting empty-srcs ts_library, this is a re-export
    srcs = ctx.rule.attr.srcs if hasattr(ctx.rule.attr, "srcs") else []

    # "re-export" rules should expose all the files of their deps
    if not srcs and hasattr(ctx.rule.attr, "deps"):
        for dep in ctx.rule.attr.deps:
            if (_has_target_angular_summaries(dep)):
                results = depset(dep.angular.summaries, transitive = [results])

    return struct(collect_summaries_aspect_result = results)

_collect_summaries_aspect = aspect(
    implementation = _collect_summaries_aspect_impl,
    attr_aspects = ["deps"],
)

# Extra options passed to Node when running ngc.
_EXTRA_NODE_OPTIONS_FLAGS = [
    # Expose the v8 garbage collection API to JS.
    "--node_options=--expose-gc",
    # Show ~full stack traces, instead of cutting off after 10 items.
    "--node_options=--stack-trace-limit=100",
    # Give 4 GB RAM to node to allow bigger google3 modules to compile.
    "--node_options=--max-old-space-size=4096",
]

def ngc_compile_action(
        ctx,
        label,
        inputs,
        outputs,
        messages_out,
        tsconfig_file,
        node_opts,
        locale = None,
        i18n_args = [],
        dts_bundles_out = None,
        compile_mode = "prodmode"):
    """Helper function to create the ngc action.

    This is exposed for google3 to wire up i18n replay rules, and is not intended
    as part of the public API.

    Args:
      ctx: skylark context
      label: the label of the ng_module being compiled
      inputs: passed to the ngc action's inputs
      outputs: passed to the ngc action's outputs
      messages_out: produced xmb files
      tsconfig_file: tsconfig file with settings used for the compilation
      node_opts: list of strings, extra nodejs options.
      locale: i18n locale, or None
      i18n_args: additional command-line arguments to ngc
      dts_bundles_out: produced flattened dts file

    Returns:
      the parameters of the compilation which will be used to replay the ngc action for i18N.
    """

    is_legacy_ngc = _is_view_engine_enabled(ctx)

    mnemonic = "AngularTemplateCompile"
    progress_message = "Compiling Angular templates (%s - %s) %s" % (_compiler_name(ctx), compile_mode, label)

    if locale:
        mnemonic = "AngularI18NMerging"
        supports_workers = "0"
        progress_message = ("Recompiling Angular templates (ngc - %s) %s for locale %s" %
                            (compile_mode, label, locale))
    else:
        supports_workers = str(int(ctx.attr._supports_workers))

    arguments = (list(_EXTRA_NODE_OPTIONS_FLAGS) +
                 ["--node_options=%s" % opt for opt in node_opts])

    # One at-sign makes this a params-file, enabling the worker strategy.
    # Two at-signs escapes the argument so it's passed through to ngc
    # rather than the contents getting expanded.
    if supports_workers == "1":
        arguments += ["@@" + tsconfig_file.path]
    else:
        arguments += ["-p", tsconfig_file.path]

    arguments += i18n_args

    ctx.actions.run(
        progress_message = progress_message,
        mnemonic = mnemonic,
        inputs = inputs,
        outputs = outputs,
        arguments = arguments,
        executable = ctx.executable.compiler,
        execution_requirements = {
            "supports-workers": supports_workers,
        },
    )

    if is_legacy_ngc and messages_out != None:
        # The base path is bin_dir because of the way the ngc
        # compiler host is configured. Under Blaze, we need to explicitly
        # point to genfiles/ to redirect the output.
        # See _expected_outs above, where the output path for the message file
        # is conditional on whether we are in Bazel.
        message_file_path = messages_out[0].short_path if _is_bazel() else "../genfiles/" + messages_out[0].short_path
        ctx.actions.run(
            inputs = inputs,
            outputs = messages_out,
            executable = ctx.executable.ng_xi18n,
            arguments = (_EXTRA_NODE_OPTIONS_FLAGS +
                         [tsconfig_file.path] +
                         [message_file_path]),
            progress_message = "Extracting Angular 2 messages (ng_xi18n)",
            mnemonic = "Angular2MessageExtractor",
        )

    if dts_bundles_out != None:
        # combine the inputs and outputs and filter .d.ts and json files
        filter_inputs = [f for f in inputs.to_list() + outputs if f.path.endswith(".d.ts") or f.path.endswith(".json")]

        if _should_produce_flat_module_outs(ctx):
            dts_entry_points = ["%s.d.ts" % _flat_module_out_file(ctx)]
        else:
            dts_entry_points = [ctx.attr.entry_point.label.name.replace(".ts", ".d.ts")]

        if _should_produce_r3_symbols_bundle(ctx):
            dts_entry_points.append(_R3_SYMBOLS_DTS_FILE)

        ctx.actions.run(
            progress_message = "Bundling DTS (%s) %s" % (compile_mode, str(ctx.label)),
            mnemonic = "APIExtractor",
            executable = ctx.executable.api_extractor,
            inputs = filter_inputs,
            outputs = dts_bundles_out,
            arguments = [
                tsconfig_file.path,
                ",".join(["/".join([ctx.bin_dir.path, ctx.label.package, f]) for f in dts_entry_points]),
                ",".join([f.path for f in dts_bundles_out]),
            ],
        )

    if not locale and not ctx.attr.no_i18n:
        return struct(
            label = label,
            tsconfig = tsconfig_file,
            inputs = inputs,
            outputs = outputs,
            compiler = ctx.executable.compiler,
        )

    return None

def _filter_ts_inputs(all_inputs):
    # The compiler only needs to see TypeScript sources from the npm dependencies,
    # but may need to look at package.json and ngsummary.json files as well.
    return [
        f
        for f in all_inputs
        if f.path.endswith(".js") or f.path.endswith(".ts") or f.path.endswith(".json")
    ]

def _compile_action(
        ctx,
        inputs,
        outputs,
        dts_bundles_out,
        messages_out,
        perf_out,
        tsconfig_file,
        node_opts,
        compile_mode):
    # Give the Angular compiler all the user-listed assets
    file_inputs = list(ctx.files.assets)

    if (type(inputs) == type([])):
        file_inputs.extend(inputs)
    else:
        # inputs ought to be a list, but allow depset as well
        # so that this can change independently of rules_typescript
        # TODO(alexeagle): remove this case after update (July 2019)
        file_inputs.extend(inputs.to_list())

    if hasattr(ctx.attr, "node_modules"):
        file_inputs.extend(_filter_ts_inputs(ctx.files.node_modules))

    # If the user supplies a tsconfig.json file, the Angular compiler needs to read it
    if hasattr(ctx.attr, "tsconfig") and ctx.file.tsconfig:
        file_inputs.append(ctx.file.tsconfig)
        if TsConfigInfo in ctx.attr.tsconfig:
            file_inputs += ctx.attr.tsconfig[TsConfigInfo].deps

    # Also include files from npm fine grained deps as action_inputs.
    # These deps are identified by the NpmPackageInfo provider.
    for d in ctx.attr.deps:
        if NpmPackageInfo in d:
            # Note: we can't avoid calling .to_list() on sources
            file_inputs.extend(_filter_ts_inputs(d[NpmPackageInfo].sources.to_list()))

    # Collect the inputs and summary files from our deps
    action_inputs = depset(
        file_inputs,
        transitive = [
            dep.collect_summaries_aspect_result
            for dep in ctx.attr.deps
            if hasattr(dep, "collect_summaries_aspect_result")
        ],
    )

    return ngc_compile_action(ctx, ctx.label, action_inputs, outputs, messages_out, tsconfig_file, node_opts, None, [], dts_bundles_out, compile_mode)

def _prodmode_compile_action(ctx, inputs, outputs, tsconfig_file, node_opts):
    outs = _expected_outs(ctx)
    return _compile_action(ctx, inputs, outputs + outs.closure_js + outs.prod_perf_files, None, outs.i18n_messages, outs.prod_perf_files, tsconfig_file, node_opts, "prodmode")

def _devmode_compile_action(ctx, inputs, outputs, tsconfig_file, node_opts):
    outs = _expected_outs(ctx)
    compile_action_outputs = outputs + outs.devmode_js + outs.declarations + outs.summaries + outs.metadata + outs.dev_perf_files
    _compile_action(ctx, inputs, compile_action_outputs, outs.dts_bundles, None, outs.dev_perf_files, tsconfig_file, node_opts, "devmode")

def _ts_expected_outs(ctx, label, srcs_files = []):
    # rules_typescript expects a function with two or more arguments, but our
    # implementation doesn't use the label(and **kwargs).
    _ignored = [label, srcs_files]
    return _expected_outs(ctx)

def ng_module_impl(ctx, ts_compile_actions):
    """Implementation function for the ng_module rule.

    This is exposed so that google3 can have its own entry point that re-uses this
    and is not meant as a public API.

    Args:
      ctx: the skylark rule context
      ts_compile_actions: generates all the actions to run an ngc compilation

    Returns:
      the result of the ng_module rule as a dict, suitable for
      conversion by ts_providers_dict_to_struct
    """

    is_legacy_ngc = _is_view_engine_enabled(ctx)

    providers = ts_compile_actions(
        ctx,
        is_library = True,
        compile_action = _prodmode_compile_action,
        devmode_compile_action = _devmode_compile_action,
        tsc_wrapped_tsconfig = _ngc_tsconfig,
        outputs = _ts_expected_outs,
    )

    outs = _expected_outs(ctx)

    providers["angular"] = {}

    if is_legacy_ngc:
        providers["angular"]["summaries"] = outs.summaries
        providers["angular"]["metadata"] = outs.metadata
        providers["ngc_messages"] = outs.i18n_messages

    if _should_produce_flat_module_outs(ctx):
        # Sanity error if more than one metadata file has been created in the
        # legacy ngc compiler while a flat module should be produced.
        if is_legacy_ngc and len(outs.metadata) > 1:
            fail("expecting exactly one metadata output for " + str(ctx.label))

        providers["angular"]["flat_module_metadata"] = struct(
            module_name = ctx.attr.module_name,
            # Metadata files are only generated in the legacy ngc compiler.
            metadata_file = outs.metadata[0] if is_legacy_ngc else None,
            typings_file = outs.bundle_index_typings,
            flat_module_out_file = _flat_module_out_file(ctx),
        )

    if outs.dts_bundles != None:
        providers["dts_bundles"] = outs.dts_bundles

    return providers

def _ng_module_impl(ctx):
    ts_providers = ng_module_impl(ctx, compile_ts)

    # Add in new JS providers
    # See design doc https://docs.google.com/document/d/1ggkY5RqUkVL4aQLYm7esRW978LgX3GUCnQirrk5E1C0/edit#
    # and issue https://github.com/bazelbuild/rules_nodejs/issues/57 for more details.
    ts_providers["providers"].extend([
        js_module_info(
            sources = ts_providers["typescript"]["es5_sources"],
            deps = ctx.attr.deps,
        ),
        js_named_module_info(
            sources = ts_providers["typescript"]["es5_sources"],
            deps = ctx.attr.deps,
        ),
        js_ecma_script_module_info(
            sources = ts_providers["typescript"]["es6_sources"],
            deps = ctx.attr.deps,
        ),
        # TODO: Add remaining shared JS providers from design doc
        # (JSModuleInfo) and remove legacy "typescript" provider
        # once it is no longer needed.
    ])

    if ctx.attr.module_name:
        path = "/".join([p for p in [ctx.bin_dir.path, ctx.label.workspace_root, ctx.label.package] if p])
        ts_providers["providers"].append(LinkablePackageInfo(
            package_name = ctx.attr.module_name,
            path = path,
            files = ts_providers["typescript"]["es5_sources"],
            _tslibrary = True,
        ))

    return ts_providers_dict_to_struct(ts_providers)

local_deps_aspects = [node_modules_aspect, _collect_summaries_aspect]

# Workaround skydoc bug which assumes DEPS_ASPECTS is a str type
[local_deps_aspects.append(a) for a in DEPS_ASPECTS]

NG_MODULE_ATTRIBUTES = {
    "srcs": attr.label_list(allow_files = [".ts"]),

    # Note: DEPS_ASPECTS is already a list, we add the cast to workaround
    # https://github.com/bazelbuild/skydoc/issues/21
    "deps": attr.label_list(
        doc = "Targets that are imported by this target",
        aspects = local_deps_aspects,
    ),
    "assets": attr.label_list(
        doc = ".html and .css files needed by the Angular compiler",
        allow_files = [
            ".css",
            # TODO(alexeagle): change this to ".ng.html" when usages updated
            ".html",
        ],
    ),
    "factories": attr.label_list(
        allow_files = [".ts", ".html"],
        mandatory = False,
    ),
    "filter_summaries": attr.bool(default = False),
    "type_check": attr.bool(default = True),
    "inline_resources": attr.bool(default = True),
    "compilation_mode": attr.string(
        doc = """Set the compilation mode for the Angular compiler.

        This attribute is a noop if Ivy is not enabled.
        """,
        values = ["partial", "full", ""],
        default = "",
    ),
    "no_i18n": attr.bool(default = False),
    "compiler": attr.label(
        doc = """Sets a different ngc compiler binary to use for this library.

        The default ngc compiler depends on the `//@angular/bazel`
        target which is setup for projects that use bazel managed npm deps that
        fetch the @angular/bazel npm package.
        """,
        default = Label(DEFAULT_NG_COMPILER),
        executable = True,
        cfg = "host",
    ),
    "ng_xi18n": attr.label(
        default = Label(DEFAULT_NG_XI18N),
        executable = True,
        cfg = "host",
    ),
    # In the angular/angular monorepo, //tools:defaults.bzl wraps the ng_module rule in a macro
    # which sets this attribute to the //packages/compiler-cli:ng_perf flag.
    # This is done to avoid exposing the flag to user projects, which would require:
    # * defining the flag within @angular/bazel and referencing it correctly here, and
    # * committing to the flag and its semantics (including the format of perf JSON files)
    #   as something users can depend upon.
    "perf_flag": attr.label(
        providers = [NgPerfInfo],
        doc = "Private API to control production of performance metric JSON files",
    ),
    "_supports_workers": attr.bool(default = True),
}

NG_MODULE_RULE_ATTRS = dict(dict(COMMON_ATTRIBUTES, **NG_MODULE_ATTRIBUTES), **{
    "tsconfig": attr.label(allow_single_file = True),
    "node_modules": attr.label(
        doc = """The npm packages which should be available during the compile.

        The default value of `//typescript:typescript__typings` is
        for projects that use bazel managed npm deps. This default is in place
        since code compiled by ng_module will always depend on at least the
        typescript default libs which are provided by
        `//typescript:typescript__typings`.

        This attribute is DEPRECATED. As of version 0.18.0 the recommended
        approach to npm dependencies is to use fine grained npm dependencies
        which are setup with the `yarn_install` or `npm_install` rules.

        For example, in targets that used a `//:node_modules` filegroup,

        ```
        ng_module(
          name = "my_lib",
          ...
          node_modules = "//:node_modules",
        )
        ```

        which specifies all files within the `//:node_modules` filegroup
        to be inputs to the `my_lib`. Using fine grained npm dependencies,
        `my_lib` is defined with only the npm dependencies that are
        needed:

        ```
        ng_module(
          name = "my_lib",
          ...
          deps = [
              "@npm//@types/foo",
              "@npm//@types/bar",
              "@npm//foo",
              "@npm//bar",
              ...
          ],
        )
        ```

        In this case, only the listed npm packages and their
        transitive deps are includes as inputs to the `my_lib` target
        which reduces the time required to setup the runfiles for this
        target (see https://github.com/bazelbuild/bazel/issues/5153).
        The default typescript libs are also available via the node_modules
        default in this case.

        The @npm external repository and the fine grained npm package
        targets are setup using the `yarn_install` or `npm_install` rule
        in your WORKSPACE file:

        yarn_install(
          name = "npm",
          package_json = "//:package.json",
          yarn_lock = "//:yarn.lock",
        )
        """,
        default = Label(
            # BEGIN-DEV-ONLY
            "@npm" +
            # END-DEV-ONLY
            "//typescript:typescript__typings",
        ),
    ),
    "entry_point": attr.label(allow_single_file = True),

    # Default is %{name}_public_index
    # The suffix points to the generated "bundle index" files that users import from
    # The default is intended to avoid collisions with the users input files.
    # Later packaging rules will point to these generated files as the entry point
    # into the package.
    # See the flatModuleOutFile documentation in
    # https://github.com/angular/angular/blob/master/packages/compiler-cli/src/transformers/api.ts
    "flat_module_out_file": attr.string(),
    "bundle_dts": attr.bool(default = False),
    "api_extractor": attr.label(
        default = Label(DEFAULT_API_EXTRACTOR),
        executable = True,
        cfg = "host",
    ),
    # Should the rule generate ngfactory and ngsummary shim files?
    "generate_ve_shims": attr.bool(default = False),
})

ng_module = rule(
    implementation = _ng_module_impl,
    attrs = NG_MODULE_RULE_ATTRS,
    outputs = COMMON_OUTPUTS,
)
"""
Run the Angular AOT template compiler.

This rule extends the [ts_library] rule.

[ts_library]: https://bazelbuild.github.io/rules_nodejs/TypeScript.html#ts_library
"""

def ng_module_macro(tsconfig = None, **kwargs):
    """Wraps `ng_module` to set the default for the `tsconfig` attribute.

    This must be a macro so that the string is converted to a label in the context of the
    workspace that declares the `ng_module` target, rather than the workspace that defines
    `ng_module`, or the workspace where the build is taking place.

    This macro is re-exported as `ng_module` in the public API.

    Args:
      tsconfig: the label pointing to a tsconfig.json file
      **kwargs: remaining args to pass to the ng_module rule
    """
    if not tsconfig:
        tsconfig = "//:tsconfig.json"

    ng_module(tsconfig = tsconfig, **kwargs)
