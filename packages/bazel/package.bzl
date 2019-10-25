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
        sha256 = "dcb58e7e5f0b4da54c6c5f8ebc65e63fcfb37414466010cf82ceff912162296e",
        strip_prefix = "bazel-toolchains-0.28.2",
        url = "https://github.com/bazelbuild/bazel-toolchains/archive/0.28.2.tar.gz",
    )

    #############################################
    # Dependencies for generating documentation #
    #############################################
    http_archive(
        name = "io_bazel_rules_sass",
        sha256 = "4f05239080175a3f4efa8982d2b7775892d656bb47e8cf56914d5f9441fb5ea6",
        url = "https://github.com/bazelbuild/rules_sass/archive/86ca977cf2a8ed481859f83a286e164d07335116.zip",
        strip_prefix = "rules_sass-86ca977cf2a8ed481859f83a286e164d07335116",
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
