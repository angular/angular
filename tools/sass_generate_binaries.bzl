load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")

# Generates multiple sass binaries based on a specified list of source files.
# All generated sass binaries will be exposed as a filegroup that has all the
# CSS outputs from the specified source files.
def sass_generate_binaries(filegroup_name, source_files, sass_deps = []):
  for source_file in source_files:
    sass_binary(
      name = source_file.replace('.scss', '_scss'),
      src = source_file,
      deps = sass_deps,
    )

  native.filegroup(
    name = filegroup_name,
    srcs = [file.replace(".scss", "_scss") for file in source_files]
  )
