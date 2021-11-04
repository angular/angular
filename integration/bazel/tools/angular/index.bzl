load("//:packages.bzl", "ANGULAR_PACKAGES")
load("@npm//@bazel/rollup:index.bzl", "rollup_bundle")

"""
  Starlark file exposing a definition for generating Angular UMD bundles
  for all entry-points the Angular framework packages expose.

  This is useful for running Karma tests which rely on AMD modules currently.
  In the future, this could be removed if Karma tests can run with ESM, or the
  logic could be simplified by running a bundler like ESBuild for tests. ESBuild
  does not support generating UMD bundles at time of writing though.
"""

def _get_target_name_base(pkg, entry_point):
    return "%s%s" % (pkg.name, "_%s" % entry_point if entry_point else "")

def _create_bundle_targets(pkg, entry_point, module_name):
    target_name_base = _get_target_name_base(pkg, entry_point)
    fesm_bundle_path = "fesm2020/%s.mjs" % (entry_point if entry_point else pkg.name)

    # Note: No dependencies are added here so that cross-package imports, or imports to
    # RxJS are not bundled.
    rollup_bundle(
        name = "%s_bundle" % target_name_base,
        entry_point = "@npm//:node_modules/@angular/%s/%s" % (pkg.name, fesm_bundle_path),
        args = ["--amd.id", module_name],
        silent = True,
        format = "amd",
    )

def create_angular_bundle_targets():
    for pkg in ANGULAR_PACKAGES:
        _create_bundle_targets(pkg, None, pkg.module_name)

        for entry_point in pkg.entry_points:
            _create_bundle_targets(pkg, entry_point, "%s/%s" % (pkg.module_name, entry_point))

FRAMEWORK_AMD_FILES = [
    "//tools/angular:%s_bundle" % _get_target_name_base(pkg, entry_point)
    for pkg in ANGULAR_PACKAGES
    for entry_point in [None] + pkg.entry_points
]
