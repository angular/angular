load("//build_defs:utils.bzl", "join_paths", "pick_file")


def _js_bundle_impl(ctx):
  """
  Rule for creating a minified bundle for JavaScript web libraries. This
  includes tree-shaking with Rollup.js, down-transpiling to ES5 with TypeScript,
  and minifying with UglifyJS.

  Args:
    srcs: Target containing the source library.
    deps: JavaScript targets which the tests depend on.
    rollup_config: Required. Rollup.js config file to use.
    entry_point: Path to the entrypoint file for tree-shaking, relative to
      the package. The entry_point should be inside the first "srcs" target.
    output: Filename of the gen .js file, relative to the package. For
      example, if you specify bundle.js, bundle.js and bundle.min.js will be
      created.
    banner: File to prepend to the gen files. Useful for e.g. copyright
      banners.
  """
  output = (ctx.attr.output or ctx.label.name + ".js")
  output_base = output[:output.rfind(".")]

  # gen_esm_js is ES6 code with UMD module.
  gen_esm_js = ctx.new_file(output_base + ".esm.js")
  gen_esm_js_map = ctx.new_file(output_base + ".esm.js.map")
  gen_js = ctx.new_file(output_base + ".js")
  gen_js_map = ctx.new_file(output_base + ".js.map")
  gen_min_js = ctx.new_file(output_base + ".min.js")
  gen_min_js_map = ctx.new_file(output_base + ".min.js.map")

  config_file = ctx.new_file("%s_rollup.config.js" % ctx.label.name)

  config_to_workspace = "/".join(
      [".." for x in ctx.configuration.bin_dir.path.split("/") if x] +
      [".." for x in ctx.label.package.split("/") if x])

  esm_inputs = []
  for src in ctx.attr.srcs:
    esm_inputs += src.javascript_esm.files + src.javascript_esm.source_maps

  main_src = ctx.attr.srcs[0]
  entry_point = pick_file(esm_inputs, main_src.label, ctx.attr.entry_point)

  ctx.template_action(
      template = ctx.file._rollup_config_template,
      output = config_file,
      substitutions = {
          "{{base_config}}": join_paths(config_to_workspace, ctx.file.rollup_config.path),
          # Unlike tsc, rollup does not resolve paths relative to
          # rollup.config.js.
          "{{prefixes}}": "\"\", \"{}\", \"{}\"".format(
              ctx.configuration.bin_dir.path, ctx.configuration.genfiles_dir.path),
          "{{entry}}": "./" + entry_point.path,
          "{{dest}}": gen_esm_js.path,
          "{{banner}}": (ctx.file.banner.path if ctx.attr.banner else ""),
      },
 )

  ctx.action(
      progress_message = "Tree shaking %s" % ctx,
      inputs = esm_inputs + ctx.files.rollup_config + ctx.files.banner + [config_file],
      outputs = [gen_esm_js, gen_esm_js_map],
      executable = ctx.executable._rollup,
      arguments = ["-c", config_file.path],
  )

  tsc_cmd = [ctx.executable._tsc.path, "--noResolve", "--target", "es5", "--allowJs", "--typeRoots",
             "[]", "--sourceMap", "--inlineSources", "--outFile", gen_js.path, gen_esm_js.path]
  ctx.action(
      progress_message = "Compiling ES6 %s" % ctx,
      inputs = [gen_esm_js, gen_esm_js_map] + list(ctx.attr._tsc.default_runfiles.files),
      outputs = [gen_js, gen_js_map],
      executable = ctx.executable._flatten_sourcemap,
      arguments = [gen_js.path, "--"] + tsc_cmd,
  )

  ctx.action(
      progress_message = "Minifying bundle of %s" % ctx,
      inputs = [gen_js, gen_js_map] + ctx.files.banner,
      outputs = [gen_min_js, gen_min_js_map],
      executable = ctx.executable._uglifyjs,
      arguments = (
          (["--preamble-file", ctx.file.banner.path] if ctx.attr.banner else []) +
          ["--compress", "--screw-ie8", "--in-source-map", gen_js_map.path,
           "--source-map-include-sources", "--output", gen_min_js.path, "--source-map-url",
           gen_min_js_map.basename, "--source-map", gen_min_js_map.path, gen_js.path]
      ),
  )

  files = [gen_js, gen_js_map, gen_min_js, gen_min_js_map]

  return struct(
      files = set(files),
      runfiles = ctx.runfiles(
          files = files,
          # TODO: Investigate why setting collect_data = True will serve the
          # source *.js files.
          collect_data = False,
          collect_default = False,
      ),
  )

js_bundle = rule(
    implementation = _js_bundle_impl,
    attrs = {
        "srcs": attr.label_list(allow_files=True, mandatory=True),
        "deps": attr.label_list(),
        "rollup_config": attr.label(allow_files=True, single_file=True, mandatory=True),
        "entry_point": attr.string(default="index.js"),
        "output": attr.string(),
        "banner": attr.label(allow_files=True, single_file=True),

        "_rollup": attr.label(default=Label("//:rollup_bin"), executable=True),
        "_uglifyjs": attr.label(
            default=Label("//build_defs/tools:uglifyjs_wrapped"), executable=True),
        "_tsc": attr.label(default=Label("//:tsc_bin"), executable=True),
        "_flatten_sourcemap": attr.label(
            default=Label("//build_defs/tools:flatten_sourcemap"), executable=True),
        "_rollup_config_template": attr.label(
            default = Label("//build_defs:rollup_config_template.js"),
            allow_files = True,
            single_file = True,
        ),
    },
)
