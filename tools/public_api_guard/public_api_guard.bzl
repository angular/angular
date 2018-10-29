# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""public_api_guard bazel target generator
"""

load("//tools/ts-api-guardian:index.bzl", "ts_api_guardian_test")

def generate_targets(golden_files):
    """Generates a list of targets to check based on the golden files passed in.
    """
    for golden_file in golden_files:
        entry_point = golden_file[:-len(".d.ts")]
        [package_name, entry_point_tail] = entry_point.split("/", 1)
        directory_name = entry_point_tail.split("/")[-1]
        target_suffix = "/" + entry_point_tail if package_name != entry_point_tail else ""
        actual_file = "angular/packages/%s%s/%s.d.ts" % (package_name, target_suffix, directory_name)
        label_name = package_name + target_suffix.replace("/", "_")

        ts_api_guardian_test(
            name = "%s_api" % label_name,
            actual = actual_file,
            data = [golden_file] + [
                "//packages/%s:%s" % (package_name + target_suffix, directory_name),
            ],
            golden = "angular/tools/public_api_guard/%s" % golden_file,
            tags = [
                "fixme-ivy-aot",  # ivy no longer emits generated index file
                "no-ivy-jit",  # we will not ship JIT compiled packages to npm
            ],
        )
