load("//build_defs:utils.bzl", "join_paths", "map_files")


def _ts_compat_impl(ctx):
  """ts_compat

  Rule to downlevel a ts_library to have TypeScript 1.8-compatiable .d.ts files.
  The resultant target is a leaf target and cannot be further depended on.

  Args:
    srcs: A singleton list of the target ts_library.
    prefix: Directory prefix to use, defaults to "compat".
  """

  if len(ctx.attr.srcs) != 1:
    fail("srcs must contain exactly one ts_library target", "srcs")

  src = ctx.attr.srcs[0]
  ts = src.typescript

  root_dir = ts.package_dir
  out_dir = join_paths(ts.package_dir, ctx.attr.prefix)

  gen_js = map_files(ctx, src.files, root_dir, out_dir)
  gen_d_ts = map_files(ctx, ts.declarations, root_dir, out_dir)
  gen_meta = map_files(ctx, ts.metadata, root_dir, out_dir)
  gen_js_map = map_files(ctx, ts.source_maps, root_dir, out_dir)

  gen_js_esm = map_files(ctx, ts.esm.files, root_dir, out_dir)
  gen_d_ts_esm = map_files(ctx, ts.esm.declarations, root_dir, out_dir)
  gen_meta_esm = map_files(ctx, ts.esm.metadata, root_dir, out_dir)
  gen_js_map_esm = map_files(ctx, ts.esm.source_maps, root_dir, out_dir)

  abs_root_dir = join_paths(ctx.configuration.bin_dir.path, ctx.label.workspace_root,
                            ctx.label.package, ts.package_dir)
  abs_out_dir = join_paths(abs_root_dir, ctx.attr.prefix)

  copy_configs = [
      (list(src.files) + ts.metadata + ts.source_maps, gen_js + gen_meta + gen_js_map, ""),
      (ts.esm.files + ts.esm.metadata + ts.esm.source_maps,
       gen_js_esm + gen_meta_esm + gen_js_map_esm, " (esm)")
  ]
  for inputs, outputs, prefix in copy_configs:
    ctx.action(
        progress_message = "Copying files for {}{}".format(ctx.label, prefix),
        inputs = inputs,
        outputs = outputs,
        executable = ctx.executable._copy,
        arguments = ["--rootDir", abs_root_dir, "--outDir", abs_out_dir] + [f.path for f in inputs],
    )

  downlevel_configs = [
      (ts.declarations, gen_d_ts, ""),
      (ts.esm.declarations, gen_d_ts_esm, " (esm)")
  ]
  for inputs, outputs, prefix in downlevel_configs:
    ctx.action(
        progress_message = "Downleveling .d.ts files for {}{}".format(ctx.label, prefix),
        inputs = inputs,
        outputs = outputs,
        executable = ctx.executable._downlevel_declaration,
        arguments = ["--node_path=tools", "--rootDir", abs_root_dir, "--outDir", abs_out_dir] +
            [f.path for f in inputs],
    )

  return struct(
      files = set(gen_js),
      runfiles = ctx.runfiles(
          files = gen_js + gen_js_map,
          collect_default = True,
          collect_data = True,
      ),
      typescript = struct(
          module_name = ts.module_name,
          # The rootDir relative to the current package.
          package_dir = out_dir,
          # The declarations of the current module
          declarations = gen_d_ts,
          source_maps = gen_js_map,
          metadata = ts.metadata,
          esm = struct(
              files = gen_js_esm,
              source_maps = gen_js_map_esm,
              declarations = gen_d_ts_esm,
              metadata = gen_meta_esm,
              module_name = ts.module_name,
              package_dir = out_dir,
          ),
          is_leaf = True,
      ),
      nodejs = struct(),
      javascript = struct(
          files = gen_js + gen_js_map,
          source_maps = gen_js_map,
          module_name = ts.module_name,
          package_dir = out_dir,
      ),
      javascript_esm = struct(
          files = gen_js_esm,
          source_maps = gen_js_map_esm,
          module_name = ts.module_name,
          package_dir = out_dir,
      ),
  )


ts_compat = rule(
    _ts_compat_impl,
    attrs = {
        "srcs": attr.label_list(providers=["typescript"], mandatory=True),
        "prefix": attr.string(default="compat"),

        "_copy": attr.label(default=Label("//build_defs/tools:copy"), executable=True),
        "_downlevel_declaration": attr.label(
            default=Label("//build_defs/tools:downlevel_declaration"), executable=True),
    },
)
