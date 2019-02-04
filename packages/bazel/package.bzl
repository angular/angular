# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

"""Package file which defines dependencies of Angular rules in skylark
"""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def rules_angular_dependencies():
    print("""DEPRECATION WARNING:
    rules_angular_dependencies is no longer needed, and will be removed in a future release.
    We assume you will fetch rules_nodejs in your WORKSPACE file, and no other dependencies remain here.
    Simply remove any calls to this function and the corresponding call to
      load("@angular//:package.bzl", "rules_angular_dependencies")
    """)

def rules_angular_dev_dependencies():
    """
    Fetch dependencies needed for local development, but not needed by users.

    These are in this file to keep version information in one place, and make the WORKSPACE
    shorter.
    """

    http_archive(
        name = "org_brotli",
        sha256 = "774b893a0700b0692a76e2e5b7e7610dbbe330ffbe3fe864b4b52ca718061d5a",
        strip_prefix = "brotli-1.0.5",
        url = "https://github.com/google/brotli/archive/v1.0.5.zip",
    )

    # Needed for Remote Execution
    _maybe(
        http_archive,
        name = "bazel_toolchains",
        sha256 = "ee854b5de299138c1f4a2edb5573d22b21d975acfc7aa938f36d30b49ef97498",
        strip_prefix = "bazel-toolchains-37419a124bdb9af2fec5b99a973d359b6b899b61",
        urls = [
            "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/37419a124bdb9af2fec5b99a973d359b6b899b61.tar.gz",
            "https://github.com/bazelbuild/bazel-toolchains/archive/37419a124bdb9af2fec5b99a973d359b6b899b61.tar.gz",
        ],
    )

    #############################################
    # Dependencies for generating documentation #
    #############################################
    http_archive(
        name = "io_bazel_rules_sass",
        strip_prefix = "rules_sass-1.15.1",
        url = "https://github.com/bazelbuild/rules_sass/archive/1.15.1.zip",
    )

    http_archive(
        name = "io_bazel_skydoc",
        strip_prefix = "skydoc-a9550cb3ca3939cbabe3b589c57b6f531937fa99",
        # TODO: switch to upstream when https://github.com/bazelbuild/skydoc/pull/103 is merged
        url = "https://github.com/alexeagle/skydoc/archive/a9550cb3ca3939cbabe3b589c57b6f531937fa99.zip",
    )

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
