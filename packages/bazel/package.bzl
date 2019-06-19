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
    _maybe(
        http_archive,
        name = "bazel_toolchains",
        sha256 = "142bcbd8cb751ce1193a1d7fef4e328493cd0a69cc0555183ad237f81418ba40",
        strip_prefix = "bazel-toolchains-628224f6cf48e81116d0ee0bf65424eaa630d5b3",
        urls = [
            "https://github.com/xingao267/bazel-toolchains/archive/628224f6cf48e81116d0ee0bf65424eaa630d5b3.tar.gz",
        ],
    )

    #############################################
    # Dependencies for generating documentation #
    #############################################
    http_archive(
        name = "io_bazel_rules_sass",
        sha256 = "76ae498b9a96fa029f026f8358ed44b93c934dde4691a798cb3a4137c307b7dc",
        strip_prefix = "rules_sass-1.15.1",
        url = "https://github.com/bazelbuild/rules_sass/archive/1.15.1.zip",
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
