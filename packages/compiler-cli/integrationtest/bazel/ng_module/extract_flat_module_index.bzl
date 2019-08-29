# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Test utility to extract the "flat_module_metadata" from transitive Angular deps.
"""

def _extract_flat_module_index(ctx):
    files = []
    for dep in ctx.attr.deps:
        if hasattr(dep, "angular"):
            metadata = dep.angular.flat_module_metadata
            files.extend([metadata.metadata_file, metadata.typings_file])
    return [DefaultInfo(files = depset(files))]

extract_flat_module_index = rule(
    implementation = _extract_flat_module_index,
    attrs = {
        "deps": attr.label_list(),
    },
)
