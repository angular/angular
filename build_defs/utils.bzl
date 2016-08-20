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
