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

    # Needed for Remote Execution
    # https://github.com/bazelbuild/bazel-toolchains/releases
    _maybe(
        http_archive,
        name = "bazel_toolchains",
        sha256 = "b5a8039df7119d618402472f3adff8a1bd0ae9d5e253f53fcc4c47122e91a3d2",
        strip_prefix = "bazel-toolchains-2.1.1",
        urls = [
            "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/releases/download/2.1.1/bazel-toolchains-2.1.1.tar.gz",
            "https://github.com/bazelbuild/bazel-toolchains/releases/download/2.1.1/bazel-toolchains-2.1.1.tar.gz",
        ],
    )

    #############################################
    # Dependencies for generating documentation #
    #############################################
    _maybe(
        http_archive,
        name = "io_bazel_rules_sass",
        sha256 = "77e241148f26d5dbb98f96fe0029d8f221c6cb75edbb83e781e08ac7f5322c5f",
        strip_prefix = "rules_sass-1.24.0",
        urls = [
            "https://github.com/bazelbuild/rules_sass/archive/1.24.0.zip",
            "https://mirror.bazel.build/github.com/bazelbuild/rules_sass/archive/1.24.0.zip",
        ],
    )

    http_archive(
        name = "io_bazel_skydoc",
        sha256 = "f88058b43112e9bdc7fdb0abbdc17c5653268708c01194a159641119195e45c6",
        strip_prefix = "skydoc-a9550cb3ca3939cbabe3b589c57b6f531937fa99",
        # TODO: switch to upstream when https://github.com/bazelbuild/skydoc/pull/103 is merged
        url = "https://github.com/alexeagle/skydoc/archive/a9550cb3ca3939cbabe3b589c57b6f531937fa99.zip",
    )

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
