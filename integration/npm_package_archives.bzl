# The @npm packages at the root node_modules are used by integration tests
# with `file:../../node_modules/foobar` references
NPM_PACKAGE_ARCHIVES = [
    "@babel/core",
    "@rollup/plugin-babel",
    "@rollup/plugin-node-resolve",
    "@rollup/plugin-commonjs",
    "check-side-effects",
    "jasmine",
    "http-server",
    "typescript",
    "rxjs",
    "systemjs",
    "tslib",
    "patch-package",
    "protractor",
    "terser",
    "rollup",
    "rollup-plugin-sourcemaps",
    "@angular/ssr",
    "@angular/build",
    "@angular/cli",
    "@angular-devkit/build-angular",
    "@bazel/bazelisk",
    "@types/jasmine",
    "@types/jasminewd2",
    "@types/node",
    "zone.js",
]

def npm_package_archive_label(package_name):
    return package_name.replace("/", "_").replace("@", "") + "_archive"

def npm_package_archives():
    """Function to generate pkg_tar definitions for WORKSPACE yarn_install manual_build_file_contents"""
    npm_packages_to_archive = NPM_PACKAGE_ARCHIVES
    result = """load("@rules_pkg//:pkg.bzl", "pkg_tar")
"""
    for name in npm_packages_to_archive:
        label_name = npm_package_archive_label(name)
        last_segment_name = name.split("/")[-1]
        result += """pkg_tar(
    name = "{label_name}",
    srcs = ["//{name}:{last_segment_name}__all_files"],
    extension = "tar.gz",
    strip_prefix = "/external/npm/node_modules/{name}",
    # should not be built unless it is a dependency of another rule
    tags = ["manual"],
)
""".format(name = name, label_name = label_name, last_segment_name = last_segment_name)
    return result
