load("@bazel_tools//tools/build_defs/pkg:pkg.bzl", "pkg_tar")
load("//build_defs:utils.bzl", "join_paths", "map_files")


# Remove testing code since we will be using the bundle.
# Ideally we would like to break up main and testing into separate compilation
# units.
def _remove_testing_and_index(ctx, package_dir, files):
  testing = join_paths(ctx.label.workspace_root, ctx.label.package, package_dir, "testing")
  index = join_paths(ctx.label.workspace_root, ctx.label.package, package_dir, "index.")
  return [f for f in files
          if not f.short_path.startswith(testing) and not f.short_path.startswith(index)]

def _ts_npm_package_impl(ctx):
  files = set()

  if len(ctx.attr.srcs) != 1:
    fail("srcs must be a singleton list", "srcs")

  src = ctx.attr.srcs[0]

  provider = src.typescript.esm if ctx.attr.esm else src.typescript
  root_dir = provider.package_dir
  out_dir = join_paths(src.typescript.package_dir, "dist")

  # Assume the input is in bin_dir, except for package.json
  abs_root_dir = join_paths(ctx.configuration.bin_dir.path, ctx.label.workspace_root,
                            ctx.label.package, root_dir)
  abs_out_dir = join_paths(ctx.configuration.bin_dir.path, ctx.label.workspace_root,
                           ctx.label.package, out_dir)

  copy_src = provider.files + provider.metadata + provider.source_maps
  if ctx.attr.esm:
    copy_src = _remove_testing_and_index(ctx, root_dir, copy_src)
  copy_dest = map_files(ctx, copy_src, root_dir, out_dir)
  ctx.action(
      progress_message = "Copying files for {}".format(ctx.label),
      inputs = copy_src,
      outputs = copy_dest,
      executable = ctx.executable._copy,
      arguments = ["--rootDir", abs_root_dir, "--outDir", abs_out_dir] + [f.path for f in copy_src],
  )

  manifest_src = ctx.file.manifest
  manifest_dest = ctx.new_file(join_paths(out_dir, "package.json"))
  ctx.action(
      progress_message = "Copying files for {}".format(ctx.label),
      inputs = [manifest_src],
      outputs = [manifest_dest],
      command = ["cp", manifest_src.path, manifest_dest.path],
  )

  downlevel_src = provider.declarations
  if ctx.attr.esm:
    downlevel_src = _remove_testing_and_index(ctx, root_dir, downlevel_src)
  downlevel_dest = map_files(ctx, downlevel_src, root_dir, out_dir)
  ctx.action(
      progress_message = "Downleveling .d.ts files for {}".format(ctx.label),
      inputs = downlevel_src,
      outputs = downlevel_dest,
      executable = ctx.executable._downlevel_declaration,
      arguments = ["--node_path=tools", "--rootDir", abs_root_dir, "--outDir", abs_out_dir] +
          [f.path for f in downlevel_src],
  )

  # Assume that data is already at the right location
  files = [manifest_dest] + copy_dest + downlevel_dest + ctx.files.data

  return struct(
      files = set(files),
      runfiles = ctx.runfiles(
          files = list(files),
      ),
  )

_ts_npm_package = rule(
    implementation = _ts_npm_package_impl,
    attrs = {
        "srcs": attr.label_list(providers=["typescript"]),
        "data": attr.label_list(allow_files=True, cfg=DATA_CFG),
        "manifest": attr.label(allow_files=True, single_file=True, mandatory=True),
        "module_name": attr.string(),
        "esm": attr.bool(default=True),

        "_copy": attr.label(default=Label("//build_defs/tools:copy"), executable=True),
        "_downlevel_declaration": attr.label(
            default=Label("//build_defs/tools:downlevel_declaration"), executable=True),
    },
)

def ts_npm_package(*, name, strip_prefix, extension=None, package_dir=None, files=[],
                   mode=None, modes=None, symlinks=None, **kwargs):
  """
  Rule to create an npm package from a ts_library target.

  Args:
    srcs: The ts_library target.
    data: Data files to be packaged.
    manifest: The package.json to be packaged.
    module_name: The ES module name of the module.
    strip_prefix: Required. The directory which files in the tarball should be relative to.
    extension, package_dir, files, mode, modes, symlinks:
      The corresponding argument in pkg_tar.
  """
  _ts_npm_package(
      name = name + "_files",
      **kwargs
  )
  pkg_tar(
      name = name,
      extension = extension,
      strip_prefix = strip_prefix,
      package_dir = package_dir,
      mode = mode,
      modes = modes,
      symlinks = symlinks,
      files = [":{}_files".format(name)] + files,
  )
