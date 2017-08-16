# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_typescript//internal:build_defs.bzl", "tsc_wrapped_tsconfig")

load(
    "@build_bazel_rules_typescript//internal:common/compilation.bzl",
    "COMMON_ATTRIBUTES", "compile_ts", "ts_providers_dict_to_struct"
)

load("@build_bazel_rules_typescript//internal:common/json_marshal.bzl", "json_marshal")

# Calculate the expected output of the template compiler for every source in
# in the library. Most of these will be produced as empty files but it is
# unknown, without parsing, which will be empty.
def _expected_outs(ctx):
  result = []

  for src in ctx.files.srcs:
    if src.short_path.endswith(".ts"):
      basename = src.short_path[len(ctx.label.package) + 1:-3]
      result += [ctx.new_file(ctx.bin_dir, basename + ext) for ext in [
        ".ngfactory.js",
        ".ngfactory.d.ts",
        ".ngsummary.js",
        ".ngsummary.d.ts",
        ".ngsummary.json",
      ]]
    elif src.short_path.endswith(".css"):
      basename = src.short_path[len(ctx.label.package) + 1:-4]
      result += [ctx.new_file(ctx.bin_dir, basename + ext) for ext in [
        ".css.shim.ngstyle.js",
        ".css.shim.ngstyle.d.ts",
        ".css.ngstyle.js",
        ".css.ngstyle.d.ts",
      ]]
  return result

def _ngc_tsconfig(ctx, files, srcs, **kwargs):
  return dict(tsc_wrapped_tsconfig(ctx, files, srcs, **kwargs), **{
      "angularCompilerOptions": {
          "expectedOut": [o.path for o in _expected_outs(ctx)],
      }
  })

def _compile_action(ctx, inputs, outputs, config_file_path):
  externs_files = []
  non_externs_files = []
  for output in outputs:
    if output.basename.endswith(".es5.MF"):
      ctx.file_action(output, content="")
    else:
      non_externs_files.append(output)

  # TODO(alexeagle): For now we mock creation of externs files
  for externs_file in externs_files:
    ctx.file_action(output=externs_file, content="")

  action_inputs = inputs
  if hasattr(ctx.attr, "node_modules"):
    action_inputs += [f for f in ctx.files.node_modules
                      if f.path.endswith(".ts") or f.path.endswith(".json")]
  if ctx.file.tsconfig:
    action_inputs += [ctx.file.tsconfig]

  # One at-sign makes this a params-file, enabling the worker strategy.
  # Two at-signs escapes the argument so it's passed through to ngc
  # rather than the contents getting expanded.
  if ctx.attr.supports_workers:
    arguments = ["@@" + config_file_path]
  else:
    arguments = ["-p", config_file_path]

  ctx.action(
      progress_message = "Compiling Angular templates (ngc) %s" % ctx.label,
      mnemonic = "AngularTemplateCompile",
      inputs = action_inputs,
      outputs = non_externs_files,
      arguments = arguments,
      executable = ctx.executable.compiler,
      execution_requirements = {
          "supports-workers": str(int(ctx.attr.supports_workers)),
      },
  )

def _devmode_compile_action(ctx, inputs, outputs, config_file_path):
  # TODO(alexeagle): compile for feeding to Closure Compiler
  _compile_action(ctx, inputs, outputs + _expected_outs(ctx), config_file_path)

def _compile_ng(ctx):
  declarations = []
  for dep in ctx.attr.deps:
    if hasattr(dep, "typescript"):
      declarations += dep.typescript.transitive_declarations

  tsconfig_json = ctx.new_file(ctx.label.name + "_tsconfig.json")
  ctx.file_action(output=tsconfig_json, content=json_marshal(
      _ngc_tsconfig(ctx, ctx.files.srcs + declarations, ctx.files.srcs)))

  _devmode_compile_action(ctx, ctx.files.srcs + declarations + [tsconfig_json], [], tsconfig_json.path)

  return {
    "files": depset(_expected_outs(ctx)),
    "typescript": {
      # FIXME: expose the right outputs so this looks like a ts_library
      "declarations": [],
      "transitive_declarations": [],
      "type_blacklisted_declarations": [],
    },
  }

def _ng_module_impl(ctx):
  if ctx.attr.write_ng_outputs_only:
    ts_providers = _compile_ng(ctx)
  else:
    ts_providers = compile_ts(ctx, is_library=True,
                              compile_action=_compile_action,
                              devmode_compile_action=_devmode_compile_action,
                              tsc_wrapped_tsconfig=_ngc_tsconfig)

  addl_declarations = [o for o in _expected_outs(ctx) if o.path.endswith(".d.ts")]
  ts_providers["typescript"]["declarations"] += addl_declarations
  ts_providers["typescript"]["transitive_declarations"] += addl_declarations

  return ts_providers_dict_to_struct(ts_providers)


ng_module = rule(
    implementation = _ng_module_impl,
    attrs = dict(COMMON_ATTRIBUTES, **{
        "srcs": attr.label_list(allow_files = True),

        # To be used only to bootstrap @angular/core compilation,
        # since we want to compile @angular/core with ngc, but ngc depends on
        # @angular/core typescript output.
        "write_ng_outputs_only": attr.bool(default = False),
        "tsconfig": attr.label(allow_files = True, single_file = True),
        "no_i18n": attr.bool(default = False),
        # TODO(alexeagle): enable workers for ngc
        "supports_workers": attr.bool(default = False),
        "compiler": attr.label(
            default = Label("//internal/ngc"),
            executable = True,
            cfg = "host",
        ),
        # @// is special syntax for the "main" repository
        # The default assumes the user specified a target "node_modules" in their
        # root BUILD file.
        "node_modules": attr.label(
            default = Label("@//:node_modules")
        ),
    }),
)