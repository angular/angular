# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""Package file which defines dependencies of Angular rules in skylark
"""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load(":rules_nodejs_package.bzl", "rules_nodejs_dependencies")
load(":rules_typescript_package.bzl", "rules_typescript_dependencies")

def rules_angular_dependencies():
    """
    Fetch our transitive dependencies.

    If the user wants to get a different version of these, they can just fetch it
    from their WORKSPACE before calling this function, or not call this function at all.
    """

    #
    # Download Bazel toolchain dependencies as needed by build actions
    #
    _maybe(
        http_archive,
        name = "build_bazel_rules_typescript",
        strip_prefix = "rules_typescript-0.17.0",
        url = "https://github.com/bazelbuild/rules_typescript/archive/0.17.0.zip",
    )

    # Needed for Remote Execution
    _maybe(
        http_archive,
        name = "bazel_toolchains",
        sha256 = "c3b08805602cd1d2b67ebe96407c1e8c6ed3d4ce55236ae2efe2f1948f38168d",
        strip_prefix = "bazel-toolchains-5124557861ebf4c0b67f98180bff1f8551e0b421",
        urls = [
            "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/5124557861ebf4c0b67f98180bff1f8551e0b421.tar.gz",
            "https://github.com/bazelbuild/bazel-toolchains/archive/5124557861ebf4c0b67f98180bff1f8551e0b421.tar.gz",
        ],
    )

    # Angular apps don't necessarily depend on Sass, but it's common enough
    _maybe(
        http_archive,
        name = "io_bazel_rules_sass",
        sha256 = "dbe9fb97d5a7833b2a733eebc78c9c1e3880f676ac8af16e58ccf2139cbcad03",
        strip_prefix = "rules_sass-1.11.0",
        url = "https://github.com/bazelbuild/rules_sass/archive/1.11.0.zip",
    )

    rules_typescript_dependencies()
    rules_nodejs_dependencies()

def rules_angular_dev_dependencies():
    """
    Fetch dependencies needed for local development, but not needed by users.

    These are in this file to keep version information in one place, and make the WORKSPACE
    shorter.
    """

    # We have a source dependency on the Devkit repository, because it's built with
    # Bazel.
    # This allows us to edit sources and have the effect appear immediately without
    # re-packaging or "npm link"ing.
    # Even better, things like aspects will visit the entire graph including
    # ts_library rules in the devkit repository.
    http_archive(
        name = "angular_cli",
        sha256 = "8cf320ea58c321e103f39087376feea502f20eaf79c61a4fdb05c7286c8684fd",
        strip_prefix = "angular-cli-6.1.0-rc.0",
        url = "https://github.com/angular/angular-cli/archive/v6.1.0-rc.0.zip",
    )

    http_archive(
        name = "org_brotli",
        sha256 = "774b893a0700b0692a76e2e5b7e7610dbbe330ffbe3fe864b4b52ca718061d5a",
        strip_prefix = "brotli-1.0.5",
        url = "https://github.com/google/brotli/archive/v1.0.5.zip",
    )

    # Fetching the Bazel source code allows us to compile the Skylark linter
    http_archive(
        name = "io_bazel",
        sha256 = "ace8cced3b21e64a8fdad68508e9b0644201ec848ad583651719841d567fc66d",
        strip_prefix = "bazel-0.17.1",
        url = "https://github.com/bazelbuild/bazel/archive/0.17.1.zip",
    )

    # This commit matches the version of buildifier in angular/ngcontainer
    # If you change this, also check if it matches the version in the angular/ngcontainer
    # version in /.circleci/config.yml
    BAZEL_BUILDTOOLS_VERSION = "49a6c199e3fbf5d94534b2771868677d3f9c6de9"

    http_archive(
        name = "com_github_bazelbuild_buildtools",
        sha256 = "edf39af5fc257521e4af4c40829fffe8fba6d0ebff9f4dd69a6f8f1223ae047b",
        strip_prefix = "buildtools-%s" % BAZEL_BUILDTOOLS_VERSION,
        url = "https://github.com/bazelbuild/buildtools/archive/%s.zip" % BAZEL_BUILDTOOLS_VERSION,
    )

    #############################################
    # Dependencies for generating documentation #
    #############################################
    http_archive(
        name = "io_bazel_skydoc",
        sha256 = "7bfb5545f59792a2745f2523b9eef363f9c3e7274791c030885e7069f8116016",
        strip_prefix = "skydoc-fe2e9f888d28e567fef62ec9d4a93c425526d701",
        # TODO: switch to upstream when https://github.com/bazelbuild/skydoc/pull/103 is merged
        url = "https://github.com/alexeagle/skydoc/archive/fe2e9f888d28e567fef62ec9d4a93c425526d701.zip",
    )

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
