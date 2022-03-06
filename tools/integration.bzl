load("//:packages.bzl", "ANGULAR_PACKAGES")

"""File which manages the NPM packages from the workspace `@npm` repository which
  should be available to integration tests"""

def _get_archive_label_of_package(package_name):
    return package_name.replace("/", "_").replace("@", "") + "_archive"

CLI_PROJECT_PACKAGES = [pkg.module_name for pkg in ANGULAR_PACKAGES] + [
    "@angular/cli",
    "@angular/compiler-cli",
    "@angular-devkit/build-angular",
    "typescript",
    "rxjs",
]

CLI_PROJECT_MAPPINGS = {
    "@npm//:%s" % _get_archive_label_of_package(pkg): pkg
    for pkg in CLI_PROJECT_PACKAGES
}

# Packages for which archives should be made available, allowing for consumption
# in integration tests as mappings for the `npm_packages` attribute.
INTEGRATION_TEST_PACKAGES = CLI_PROJECT_PACKAGES + [
    # additional packages for integration tests, not commonly part of CLI apps.
]

def create_npm_package_archive_build_file():
    """Creates the contents of a `BUILD.bazel` file for exposing NPM package tarballs
      for the integration test packages configured in the constant.

      The `BUILD.bazel` file contents are supposed to be placed into the `@npm//`
      workspace top-level BUILD file. This is necessary because all files of a NPM
      package are not accessible outside from the `@npm//` workspace.
      """

    result = """load("@rules_pkg//:pkg.bzl", "pkg_tar")"""

    for pkg in INTEGRATION_TEST_PACKAGES:
        label_name = _get_archive_label_of_package(pkg)
        last_segment = pkg.split("/")[-1]

        result += """
pkg_tar(
    name = "{label_name}",
    srcs = ["//{name}:{last_segment}__all_files"],
    extension = "tar.gz",
    package_dir = "package/",
    strip_prefix = "/external/npm/node_modules/{name}",
    tags = ["manual"],
)""".format(name = pkg, label_name = label_name, last_segment = last_segment)

    return result
