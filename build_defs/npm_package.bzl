load("@bazel_tools//tools/build_defs/pkg:pkg.bzl", "pkg_tar")
load("//build_defs:utils.bzl", "join_paths")

def _ts_npm_package_impl(ctx):
  files = set()

  if len(ctx.attr.srcs) != 1:
    fail("srcs must be a singleton list", "srcs")

  src = ctx.attr.srcs[0]
  files += src.files
  files += src.typescript.declarations
  files += src.typescript.metadata
  if ctx.attr.esm:
    files += src.typescript.esm.files
    files += src.typescript.esm.declarations
    files += src.typescript.esm.metadata
  # TODO: add data from ts_library

  files += ctx.files.data

  # Copy manifest if it is not in the right location
  manifest_path = join_paths(src.label.workspace_root, src.label.package,
                             src.typescript.package_dir, "package.json")
  input_manifest = ctx.file.manifest
  if input_manifest.short_path != manifest_path:
    output_manifest = ctx.new_file(join_paths(src.typescript.package_dir, "package.json"))
    ctx.action(inputs=[input_manifest], outputs=[output_manifest],
               command=["cp", input_manifest.path, output_manifest.path])
  else:
    output_manifest = ctx.file.manifest

  files += [output_manifest]

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
