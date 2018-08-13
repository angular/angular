# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Run Angular's AOT template compiler
"""

load(
    ":rules_typescript.bzl",
    "COMMON_ATTRIBUTES",
    "COMMON_OUTPUTS",
    "DEPS_ASPECTS",
    "compile_ts",
    "ts_providers_dict_to_struct",
    "tsc_wrapped_tsconfig",
)

def compile_strategy(ctx):
    """Detect which strategy should be used to implement ng_module.

    Depending on the value of the 'compile' define flag or the '_global_mode' attribute, ng_module
    can be implemented in various ways. This function reads the configuration passed by the user and
    determines which mode is active.

    Args:
      ctx: skylark rule execution context

    Returns:
      one of 'legacy', 'local', 'jit', or 'global' depending on the configuration in ctx
    """

    strategy = "legacy"
    if "compile" in ctx.var:
        strategy = ctx.var["compile"]

    if strategy not in ["legacy", "local", "jit"]:
        fail("Unknown --define=compile value '%s'" % strategy)

    if strategy == "legacy" and hasattr(ctx.attr, "_global_mode") and ctx.attr._global_mode:
        strategy = "global"

    return strategy

def _compiler_name(ctx):
    """Selects a user-visible name depending on the current compilation strategy.

    Args:
      ctx: skylark rule execution context

    Returns:
      the name of the current compiler to be displayed in build output
    """

    strategy = compile_strategy(ctx)
    if strategy == "legacy":
        return "ngc"
    elif strategy == "global":
        return "ngc.ivy"
    elif strategy == "local":
        return "ngtsc"
    elif strategy == "jit":
        return "tsc"
    else:
        fail("unreachable")

def _enable_ivy_value(ctx):
    """Determines the value of the enableIvy option in the generated tsconfig.

    Args:
      ctx: skylark rule execution context

    Returns:
      the value of enableIvy that needs to be set in angularCompilerOptions in the generated tsconfig
    """

    strategy = compile_strategy(ctx)
    if strategy == "legacy":
        return False
    elif strategy == "global":
        return True
    elif strategy == "local":
        return "ngtsc"
    elif strategy == "jit":
        return "tsc"
    else:
        fail("unreachable")

def _include_ng_files(ctx):
    """Determines whether Angular outputs will be produced by the current compilation strategy.

    Args:
      ctx: skylark rule execution context

    Returns:
      true iff the current compilation strategy will produce View Engine compilation outputs (such as
      factory files), false otherwise
    """

    strategy = compile_strategy(ctx)
    return strategy == "legacy" or strategy == "global"

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
    if hasattr(ctx.attr, "flat_module_out_file") and ctx.attr.flat_module_out_file:
        return ctx.attr.flat_module_out_file
    return "%s_public_index" % ctx.label.name

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
    include_ng_files = _include_ng_files(ctx)

    devmode_js_files = []
    closure_js_files = []
    declaration_files = []
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
            if include_ng_files and (len(factory_basename_set) == 0 or basename in factory_basename_set):
                devmode_js = [
                    ".ngfactory.js",
                    ".ngsummary.js",
                    ".js",
                ]
                summaries = [".ngsummary.json"]
                metadata = [".metadata.json"]
            else:
                devmode_js = [".js"]
                if not _is_bazel():
                    devmode_js += [".ngfactory.js"]
                summaries = []
                metadata = []
        elif include_ng_files and short_path.endswith(".css"):
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
        closure_js = [f.replace(".js", ".closure.js") for f in devmode_js if not filter_summaries or not f.endswith(".ngsummary.js")]
        declarations = [f.replace(".js", ".d.ts") for f in devmode_js]

        devmode_js_files += [ctx.actions.declare_file(basename + ext) for ext in devmode_js]
        closure_js_files += [ctx.actions.declare_file(basename + ext) for ext in closure_js]
        declaration_files += [ctx.actions.declare_file(basename + ext) for ext in declarations]
        summary_files += [ctx.actions.declare_file(basename + ext) for ext in summaries]
        if not _is_bazel():
            metadata_files += [ctx.actions.declare_file(basename + ext) for ext in metadata]

    # We do this just when producing a flat module index for a publishable ng_module
    if include_ng_files and _should_produce_flat_module_outs(ctx):
        flat_module_out = _flat_module_out_file(ctx)
        devmode_js_files.append(ctx.actions.declare_file("%s.js" % flat_module_out))
        closure_js_files.append(ctx.actions.declare_file("%s.closure.js" % flat_module_out))
        bundle_index_typings = ctx.actions.declare_file("%s.d.ts" % flat_module_out)
        declaration_files.append(bundle_index_typings)
        metadata_files.append(ctx.actions.declare_file("%s.metadata.json" % flat_module_out))
    else:
        bundle_index_typings = None

    # TODO(alxhub): i18n is only produced by the legacy compiler currently. This should be re-enabled
    # when ngtsc can extract messages
    if include_ng_files:
        i18n_messages_files = [ctx.new_file(ctx.genfiles_dir, ctx.label.name + "_ngc_messages.xmb")]
    else:
        i18n_messages_files = []

    return struct(
        closure_js = closure_js_files,
        devmode_js = devmode_js_files,
        declarations = declaration_files,
        summaries = summary_files,
        metadata = metadata_files,
        bundle_index_typings = bundle_index_typings,
        i18n_messages = i18n_messages_files,
    )

def _ngc_tsconfig(ctx, files, srcs, **kwargs):
    outs = _expected_outs(ctx)
    include_ng_files = _include_ng_files(ctx)
    if "devmode_manifest" in kwargs:
        expected_outs = outs.devmode_js + outs.declarations + outs.summaries + outs.metadata
    else:
        expected_outs = outs.closure_js

    angular_compiler_options = {
        "enableResourceInlining": ctx.attr.inline_resources,
        "generateCodeForLibraries": False,
        "allowEmptyCodegenFiles": True,
        # Summaries are only enabled if Angular outputs are to be produced.
        "enableSummariesForJit": include_ng_files,
        "enableIvy": _enable_ivy_value(ctx),
        "fullTemplateTypeCheck": ctx.attr.type_check,
        # FIXME: wrong place to de-dupe
        "expectedOut": depset([o.path for o in expected_outs]).to_list(),
    }

    if _should_produce_flat_module_outs(ctx):
        angular_compiler_options["flatModuleId"] = ctx.attr.module_name
        angular_compiler_options["flatModuleOutFile"] = _flat_module_out_file(ctx)
        angular_compiler_options["flatModulePrivateSymbolPrefix"] = "_".join(
            [ctx.workspace_name] + ctx.label.package.split("/") + [ctx.label.name, ""],
        )

    return dict(tsc_wrapped_tsconfig(ctx, files, srcs, **kwargs), **{
        "angularCompilerOptions": angular_compiler_options,
    })

def _collect_summaries_aspect_impl(target, ctx):
    results = depset(target.angular.summaries if hasattr(target, "angular") else [])

    # If we are visiting empty-srcs ts_library, this is a re-export
    srcs = ctx.rule.attr.srcs if hasattr(ctx.rule.attr, "srcs") else []

    # "re-export" rules should expose all the files of their deps
    if not srcs and hasattr(ctx.rule.attr, "deps"):
        for dep in ctx.rule.attr.deps:
            if (hasattr(dep, "angular")):
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
        i18n_args = []):
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

    Returns:
      the parameters of the compilation which will be used to replay the ngc action for i18N.
    """

    include_ng_files = _include_ng_files(ctx)

    mnemonic = "AngularTemplateCompile"
    progress_message = "Compiling Angular templates (%s) %s" % (_compiler_name(ctx), label)

    if locale:
        mnemonic = "AngularI18NMerging"
        supports_workers = "0"
        progress_message = ("Recompiling Angular templates (ngc) %s for locale %s" %
                            (label, locale))
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

    if include_ng_files and messages_out != None:
        ctx.actions.run(
            inputs = list(inputs),
            outputs = messages_out,
            executable = ctx.executable._ng_xi18n,
            arguments = (_EXTRA_NODE_OPTIONS_FLAGS +
                         [tsconfig_file.path] +
                         # The base path is bin_dir because of the way the ngc
                         # compiler host is configured. So we need to explicitly
                         # point to genfiles/ to redirect the output.
                         ["../genfiles/" + messages_out[0].short_path]),
            progress_message = "Extracting Angular 2 messages (ng_xi18n)",
            mnemonic = "Angular2MessageExtractor",
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

def _compile_action(ctx, inputs, outputs, messages_out, tsconfig_file, node_opts):
    # Give the Angular compiler all the user-listed assets
    file_inputs = list(ctx.files.assets)

    # The compiler only needs to see TypeScript sources from the npm dependencies,
    # but may need to look at package.json and ngsummary.json files as well.
    if hasattr(ctx.attr, "node_modules"):
        file_inputs += [
            f
            for f in ctx.files.node_modules
            if f.path.endswith(".ts") or f.path.endswith(".json")
        ]

    # If the user supplies a tsconfig.json file, the Angular compiler needs to read it
    if hasattr(ctx.attr, "tsconfig") and ctx.file.tsconfig:
        file_inputs.append(ctx.file.tsconfig)

    # Collect the inputs and summary files from our deps
    action_inputs = depset(
        file_inputs,
        transitive = [inputs] + [
            dep.collect_summaries_aspect_result
            for dep in ctx.attr.deps
            if hasattr(dep, "collect_summaries_aspect_result")
        ],
    )

    return ngc_compile_action(ctx, ctx.label, action_inputs, outputs, messages_out, tsconfig_file, node_opts)

def _prodmode_compile_action(ctx, inputs, outputs, tsconfig_file, node_opts):
    outs = _expected_outs(ctx)
    return _compile_action(ctx, inputs, outputs + outs.closure_js, outs.i18n_messages, tsconfig_file, node_opts)

def _devmode_compile_action(ctx, inputs, outputs, tsconfig_file, node_opts):
    outs = _expected_outs(ctx)
    compile_action_outputs = outputs + outs.devmode_js + outs.declarations + outs.summaries + outs.metadata
    _compile_action(ctx, inputs, compile_action_outputs, None, tsconfig_file, node_opts)

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

    include_ng_files = _include_ng_files(ctx)

    providers = ts_compile_actions(
        ctx,
        is_library = True,
        compile_action = _prodmode_compile_action,
        devmode_compile_action = _devmode_compile_action,
        tsc_wrapped_tsconfig = _ngc_tsconfig,
        outputs = _ts_expected_outs,
    )

    outs = _expected_outs(ctx)

    if include_ng_files:
        providers["angular"] = {
            "summaries": outs.summaries,
            "metadata": outs.metadata,
        }
        providers["ngc_messages"] = outs.i18n_messages

    if include_ng_files and _should_produce_flat_module_outs(ctx):
        if len(outs.metadata) > 1:
            fail("expecting exactly one metadata output for " + str(ctx.label))

        providers["angular"]["flat_module_metadata"] = struct(
            module_name = ctx.attr.module_name,
            metadata_file = outs.metadata[0],
            typings_file = outs.bundle_index_typings,
            flat_module_out_file = _flat_module_out_file(ctx),
        )

    return providers

def _ng_module_impl(ctx):
    return ts_providers_dict_to_struct(ng_module_impl(ctx, compile_ts))

NG_MODULE_ATTRIBUTES = {
    "srcs": attr.label_list(allow_files = [".ts"]),

    # Note: DEPS_ASPECTS is already a list, we add the cast to workaround
    # https://github.com/bazelbuild/skydoc/issues/21
    "deps": attr.label_list(
        doc = "Targets that are imported by this target",
        aspects = list(DEPS_ASPECTS) + [_collect_summaries_aspect],
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
    "no_i18n": attr.bool(default = False),
    "compiler": attr.label(
        default = Label("//packages/bazel/src/ngc-wrapped"),
        executable = True,
        cfg = "host",
    ),
    "_ng_xi18n": attr.label(
        default = Label("//packages/bazel/src/ngc-wrapped:xi18n"),
        executable = True,
        cfg = "host",
    ),
    "_supports_workers": attr.bool(default = True),
}

NG_MODULE_RULE_ATTRS = dict(dict(COMMON_ATTRIBUTES, **NG_MODULE_ATTRIBUTES), **{
    "tsconfig": attr.label(allow_files = True, single_file = True),

    # @// is special syntax for the "main" repository
    # The default assumes the user specified a target "node_modules" in their
    # root BUILD file.
    "node_modules": attr.label(
        default = Label("@//:node_modules"),
    ),
    "entry_point": attr.string(),

    # Default is %{name}_public_index
    # The suffix points to the generated "bundle index" files that users import from
    # The default is intended to avoid collisions with the users input files.
    # Later packaging rules will point to these generated files as the entry point
    # into the package.
    # See the flatModuleOutFile documentation in
    # https://github.com/angular/angular/blob/master/packages/compiler-cli/src/transformers/api.ts
    "flat_module_out_file": attr.string(),
})

ng_module = rule(
    implementation = _ng_module_impl,
    attrs = NG_MODULE_RULE_ATTRS,
    outputs = COMMON_OUTPUTS,
)
"""
Run the Angular AOT template compiler.

This rule extends the [ts_library] rule.

[ts_library]: http://tsetse.info/api/build_defs.html#ts_library
"""

# TODO(alxhub): this rule causes legacy ngc to produce Ivy outputs from global analysis information.
# It exists to facilitate testing of the Ivy runtime until ngtsc is mature enough to be used
# instead, and should be removed once ngtsc is capable of fulfilling the same requirements.
internal_global_ng_module = rule(
    implementation = _ng_module_impl,
    attrs = dict(NG_MODULE_RULE_ATTRS, **{
        "_global_mode": attr.bool(
            default = True,
        ),
    }),
    outputs = COMMON_OUTPUTS,
)
