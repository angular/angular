def join_paths(*paths):
  segments = []
  for path in paths:
    segments += path.split("/")

  return "/".join([seg for seg in segments if seg])


def normalize_path(path):
  segments = []
  for seg in path.split("/"):
    if seg == "..":
      if segments:
        segments.pop()
      else:
        segments.append("..")
    elif seg and seg != ".":
      segments.append(seg)

  return "/".join(segments)


def drop_dir(path, directory):
  if not path.startswith(directory):
    fail("Path \"%s\" does not reside in directory \"%s\"" % (path, directory))
  if directory:
    return path[len(directory) + 1:]
  else:
    return path


def map_files(ctx, files, root_dir, out_dir, ext=None):
  """Creates a list of output files given directory and the extension.

  root_dir and out_dir are specified relative to the package.
  """
  ret = []
  for f in files:
    path_in_package = drop_dir(f.short_path, ctx.label.package)
    if ext != None:
      path_in_package_without_ext = path_in_package[:path_in_package.rfind(".")]
      filename = join_paths(out_dir, drop_dir(path_in_package_without_ext, root_dir) + ext)
    else:
      filename = join_paths(out_dir, drop_dir(path_in_package, root_dir))
    ret.append(ctx.new_file(filename))

  return ret


def pick_file(files, base_label, path, attr=None):
  """Returns the file within the target which matches the specified package-
  relative path.

  Args:
    files: A list of files to check.
    base_label: The label of the package of interest.
    path: The path of the needed file relative to `base_label`.
  """

  match, remainder_path = pick_file_in_dir(files, base_label, path, attr)

  if remainder_path:
    fail("Cannot find '{}' in package '{}'. Available files are: \n{}".format(
        path, base_label.package, "\n".join([f.path for f in files])), attr)

  return match


def pick_file_in_dir(files, base_label, path, attr=None):
  """Finds the file or directory containing the file specified by
  `base_label` and `path` inside the list `files`.
  Returns a tuple (file, path) where file is the found file or directory
  and path is the remaining path to be appended in order to get to the actual
  file.

  This is used to perform best-effort analysis-phase checking of a file
  addressed by a path within a target, e.g. for entry_point in nodejs_binary.

  Args:
    files: A list of files to check.
    base_label: The label of the package of interest.
    path: The path of the needed file relative to `base_label`.
  """

  short_path = join_paths(base_label.package, path)

  # We assume that a parent directory of an input file is not also an input
  # file.
  matches = [f for f in files
             if short_path == f.short_path or short_path.startswith(f.short_path + "/")]

  if not matches:
    fail("Cannot find '{}' in package '{}'. Available files are: \n{}".format(
        path, base_label.package, "\n".join([f.path for f in files])), attr)

  if len(matches) > 1:
    # We neglect cases whether two files in a target come from different
    # workspaces.
    fail("Multiple matches of '{}' found in package '{}'!".format(path, base_label.package), attr)

  remainder_path = short_path[len(matches[0].short_path) + 1:]

  return (matches[0], remainder_path)


def pseudo_json_encode(dictionary):
  # We abuse the fact that str() of a dict is almost a valid JSON object, and
  # that we do not use characters requiring escaping.
  return str(dictionary).replace("True", "true").replace("False", "false")


def _pick_provider_impl(ctx):
  """pick_provider

  Rule that serves as an escape hatch for complex Skylark-based rules to easily
  expose multiple targets that correspond to a subset of the provider. This
  allows genrules or macros to build upon these targets.

  Args:
    srcs: The targets to pick the provider from.
    providers: A list of dotted keys to pick under the target. The files in that
      path will be collected.
  """
  files = set()

  for src in ctx.attr.srcs:
    for provider in ctx.attr.providers:
      keys = provider.split(".")
      out = src
      for k in keys:
        if not hasattr(out, k):
          fail("Target {} does not have provider \"{}\"".format(src.label, provider), "srcs")
        out = getattr(out, k)
      files += out

  return struct(
      files = files,
      runfiles = ctx.runfiles(
          files = list(files),
          collect_default = True,
          collect_data = True,
      ),
  )

pick_provider = rule(
    _pick_provider_impl,
    attrs = {
        "srcs": attr.label_list(mandatory=True),
        "providers": attr.string_list(mandatory=True),
    },
)
