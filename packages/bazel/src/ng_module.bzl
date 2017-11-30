# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load(":rules_typescript.bzl",
    "tsc_wrapped_tsconfig",
    "COMMON_ATTRIBUTES",
    "COMMON_OUTPUTS",
    "compile_ts",
    "DEPS_ASPECTS",
    "ts_providers_dict_to_struct",
    "json_marshal",
)

# Calculate the expected output of the template compiler for every source in
# in the library. Most of these will be produced as empty files but it is
# unknown, without parsing, which will be empty.
def _expected_outs(ctx, label):
  devmode_js_files = []
  closure_js_files = []
  declaration_files = []
  summary_files = []

  codegen_inputs = ctx.files.srcs

  for src in ctx.files.srcs + ctx.files.assets:
    if src.short_path.endswith(".ts") and not src.short_path.endswith(".d.ts"):
      basename = src.short_path[len(ctx.label.package) + 1:-len(".ts")]
      devmode_js = [
          ".ngfactory.js",
          ".ngsummary.js",
          ".js",
      ]
      summaries = [".ngsummary.json"]

    elif src.short_path.endswith(".css"):
      basename = src.short_path[len(ctx.label.package) + 1:-len(".css")]
      devmode_js = [
          ".css.shim.ngstyle.js",
          ".css.ngstyle.js",
      ]
      summaries = []

    closure_js = [f.replace(".js", ".closure.js") for f in devmode_js]
    declarations = [f.replace(".js", ".d.ts") for f in devmode_js]

    devmode_js_files += [ctx.new_file(ctx.bin_dir, basename + ext) for ext in devmode_js]
    closure_js_files += [ctx.new_file(ctx.bin_dir, basename + ext) for ext in closure_js]
    declaration_files += [ctx.new_file(ctx.bin_dir, basename + ext) for ext in declarations]
    summary_files += [ctx.new_file(ctx.bin_dir, basename + ext) for ext in summaries]

  i18n_messages_files = [ctx.new_file(ctx.genfiles_dir, ctx.label.name + "_ngc_messages.xmb")]

  return struct(
    closure_js = closure_js_files,
    devmode_js = devmode_js_files,
    declarations = declaration_files,
    summaries = summary_files,
    i18n_messages = i18n_messages_files,
  )

def _ngc_tsconfig(ctx, files, srcs, **kwargs):
  outs = _expected_outs(ctx, ctx.label)
  if "devmode_manifest" in kwargs:
    expected_outs = outs.devmode_js + outs.declarations + outs.summaries
  else:
    expected_outs = outs.closure_js

  return dict(tsc_wrapped_tsconfig(ctx, files, srcs, **kwargs), **{
      "angularCompilerOptions": {
          "generateCodeForLibraries": False,
          "allowEmptyCodegenFiles": True,
          "enableSummariesForJit": True,
          # FIXME: wrong place to de-dupe
          "expectedOut": depset([o.path for o in expected_outs]).to_list()
      }
  })

def _collect_summaries_aspect_impl(target, ctx):
  results = target.angular.summaries if hasattr(target, "angular") else depset()

  # If we are visiting empty-srcs ts_library, this is a re-export
  srcs = ctx.rule.attr.srcs if hasattr(ctx.rule.attr, "srcs") else []

  # "re-export" rules should expose all the files of their deps
  if not srcs:
    for dep in ctx.rule.attr.deps:
      if (hasattr(dep, "angular")):
        results += dep.angular.summaries

  return struct(collect_summaries_aspect_result = results)

_collect_summaries_aspect = aspect(
    implementation = _collect_summaries_aspect_impl,
    attr_aspects = ["deps"],
)

# Extra options passed to Node when running ngc.
_EXTRA_NODE_OPTIONS_FLAGS = [
    # Expose the v8 garbage collection API to JS.
    "--node_options=--expose-gc"
]

def ngc_compile_action(ctx, label, inputs, outputs, messages_out, config_file_path,
                       locale=None, i18n_args=[]):
  mnemonic = "AngularTemplateCompile"
  progress_message = "Compiling Angular templates (ngc) %s" % label
  supports_workers = "0"
  if locale:
    mnemonic = "AngularI18NMerging"
    supports_workers = "0"
    progress_message = ("Recompiling Angular templates (ngc) %s for locale %s" %
                        (label, locale))
  else:
    supports_workers = str(int(ctx.attr._supports_workers))

  arguments = list(_EXTRA_NODE_OPTIONS_FLAGS)
  # One at-sign makes this a params-file, enabling the worker strategy.
  # Two at-signs escapes the argument so it's passed through to ngc
  # rather than the contents getting expanded.
  if supports_workers == "1":
    arguments += ["@@" + config_file_path]
  else:
    arguments += ["-p", config_file_path]

  arguments += i18n_args

  ctx.action(
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

  if messages_out != None:
    ctx.action(inputs = list(inputs),
               outputs = messages_out,
               executable = ctx.executable._ng_xi18n,
               arguments = (_EXTRA_NODE_OPTIONS_FLAGS +
                            [config_file_path] +
                            # The base path is bin_dir because of the way the ngc
                            # compiler host is configured. So we need to explictily
                            # point to genfiles/ to redirect the output.
                            ["../genfiles/" + messages_out[0].short_path]),
               progress_message = "Extracting Angular 2 messages (ng_xi18n)",
               mnemonic = "Angular2MessageExtractor")

  # Return the parameters of the compilation which will be used to replay the
  # ngc action for i18N.
  if not locale and not ctx.attr.no_i18n:
    return struct(
        label = label,
        tsconfig = config_file_path,
        inputs = inputs,
        outputs = outputs,
    )

def _compile_action(ctx, inputs, outputs, messages_out, config_file_path):
  summaries = depset()
  for dep in ctx.attr.deps:
    if hasattr(dep, "collect_summaries_aspect_result"):
      summaries += dep.collect_summaries_aspect_result

  action_inputs = inputs + summaries.to_list() + ctx.files.assets
  # print("ASSETS", [a.path for a in ctx.files.assets])
  # print("INPUTS", ctx.label, [o.path for o in summaries if o.path.find("core/src") > 0])

  if hasattr(ctx.attr, "node_modules"):
    action_inputs += [f for f in ctx.files.node_modules
                      if f.path.endswith(".ts") or f.path.endswith(".json")]
  if hasattr(ctx.attr, "tsconfig") and ctx.file.tsconfig:
    action_inputs += [ctx.file.tsconfig]

  return ngc_compile_action(ctx, ctx.label, action_inputs, outputs, messages_out, config_file_path)


def _prodmode_compile_action(ctx, inputs, outputs, config_file_path):
  outs = _expected_outs(ctx, ctx.label)
  return _compile_action(ctx, inputs, outputs + outs.closure_js, outs.i18n_messages, config_file_path)

def _devmode_compile_action(ctx, inputs, outputs, config_file_path):
  outs = _expected_outs(ctx, ctx.label)
  _compile_action(ctx, inputs, outputs + outs.devmode_js + outs.declarations + outs.summaries, None, config_file_path)

def ng_module_impl(ctx, ts_compile_actions):
  providers = ts_compile_actions(
      ctx, is_library=True, compile_action=_prodmode_compile_action,
      devmode_compile_action=_devmode_compile_action,
      tsc_wrapped_tsconfig=_ngc_tsconfig,
      outputs = _expected_outs)

  #addl_declarations = [_expected_outs(ctx)]
  #providers["typescript"]["declarations"] += addl_declarations
  #providers["typescript"]["transitive_declarations"] += addl_declarations
  outs = _expected_outs(ctx, ctx.label)
  providers["angular"] = {
    "summaries": _expected_outs(ctx, ctx.label).summaries
  }
  providers["ngc_messages"] = outs.i18n_messages

  return providers

def _ng_module_impl(ctx):
  return ts_providers_dict_to_struct(ng_module_impl(ctx, compile_ts))

NG_MODULE_ATTRIBUTES = {
    "srcs": attr.label_list(allow_files = [".ts"]),

    "deps": attr.label_list(aspects = DEPS_ASPECTS + [_collect_summaries_aspect]),

    "assets": attr.label_list(allow_files = [
      ".css",
      # TODO(alexeagle): change this to ".ng.html" when usages updated
      ".html",
    ]),

    "no_i18n": attr.bool(default = False),

    "compiler": attr.label(
        default = Label("//src/ngc-wrapped"),
        executable = True,
        cfg = "host",
    ),

    "_ng_xi18n": attr.label(
        default = Label("//src/ngc-wrapped:xi18n"),
        executable = True,
        cfg = "host",
    ),

    "_supports_workers": attr.bool(default = True),
}

ng_module = rule(
    implementation = _ng_module_impl,
    attrs = COMMON_ATTRIBUTES + NG_MODULE_ATTRIBUTES + {
        "tsconfig": attr.label(allow_files = True, single_file = True),

        # @// is special syntax for the "main" repository
        # The default assumes the user specified a target "node_modules" in their
        # root BUILD file.
        "node_modules": attr.label(
            default = Label("@//:node_modules")
        ),
    },
    outputs = COMMON_OUTPUTS,
)
