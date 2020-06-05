load("@build_bazel_rules_nodejs//:providers.bzl", "NpmPackageInfo")
load("@io_bazel_rules_sass//:defs.bzl", "SassInfo")

"""
  Filters a list of files to only return Sass files (with the `.scss` extension).
"""

def _filter_sass_files(files):
    return [f for f in files if f.short_path.endswith(".scss")]

"""
  Rule that extracts Sass sources and its transitive dependencies from a NPM
  package. The extracted source files are provided with the `SassInfo` provider
  so that they can be consumed directly as dependencies of other Sass libraries
  or Sass binaries.

  This rule is helpful when build targets rely on Sass files provided by an external
  NPM package. In those cases, one wouldn't want to list out all individual source
  files of the NPM package, but rather glob all needed Sass files from the NPM package.
"""

def _npm_sass_library_impl(ctx):
    transitive_sources = []

    # Iterate through all specified dependencies and collect Sass files from build
    # targets that have the `NpmPackageInfo` provider set. The `yarn_install` rule
    # automatically sets these providers for individual targets in `@npm//<..>`.
    for dep in ctx.attr.deps:
        npm_info = dep[NpmPackageInfo]
        if npm_info != None:
            filered_files = _filter_sass_files(npm_info.sources.to_list())
            transitive_sources.append(depset(filered_files))

    # Convert the collected transitive Sass sources to a depset. This is necessary
    # for proper deduping of dependencies. Performance-wise it's not efficient that
    # we need to unwrap the depset for NPM packages, but this is necessary to ensure
    # incrementality and efficient sandboxing for targets relying on these outputs.
    outputs = depset(transitive = transitive_sources)

    return [
        DefaultInfo(files = outputs),
        SassInfo(transitive_sources = outputs),
    ]

npm_sass_library = rule(
    implementation = _npm_sass_library_impl,
    attrs = {
        "deps": attr.label_list(allow_files = True, mandatory = True),
    },
)
