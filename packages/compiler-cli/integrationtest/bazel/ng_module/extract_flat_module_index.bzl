# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Test utility to extract the "flat_module_metadata" from transitive Angular deps.
"""

def _extract_flat_module_index(ctx):
    files = []
    for dep in ctx.attr.deps:
        if hasattr(dep, "angular") and hasattr(dep.angular, "flat_module_metadata"):
            flat_module = dep.angular.flat_module_metadata
            files.append(flat_module.typings_file)

            # The flat module metadata file could be `None` for targets
            # built with Ivy. No metadata files are generated in ngtsc.
            if flat_module.metadata_file != None:
                files.append(flat_module.metadata_file)
    return [DefaultInfo(files = depset(files))]

extract_flat_module_index = rule(
    implementation = _extract_flat_module_index,
    attrs = {
        "deps": attr.label_list(),
    },
)
