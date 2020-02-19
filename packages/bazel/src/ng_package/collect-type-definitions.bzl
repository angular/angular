# Copyright Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""Collect TypeScript definition files from a rule context.

This is used to find all files that will be copied into a "ng_package".
"""

load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo")

def _filter_typing_files(files):
    return [file for file in files if file.path.endswith(".d.ts")]

def collect_type_definitions(ctx):
    """Returns a file tree containing only TypeScript definition files.

    This is useful when packaging a "ng_package" where we only want to package specified
    definition files.

    Args:
      ctx: ctx.

    Returns:
      A file tree containing only TypeScript definition files.
    """

    # Add all source files and filter for TypeScript definition files
    # See: https://docs.bazel.build/versions/master/skylark/lib/File.html#is_source
    collected_files = _filter_typing_files([d for d in ctx.files.deps if d.is_source])

    # In case source files have been explicitly specified in the attributes, just collect
    # them and filter for definition files.
    if hasattr(ctx.attr, "srcs"):
        collected_files += _filter_typing_files(ctx.files.srcs)

    # Collect all TypeScript definition files from the specified dependencies.
    for dep in ctx.attr.deps:
        if DeclarationInfo in dep:
            collected_files += dep[DeclarationInfo].transitive_declarations.to_list()

    return collected_files
