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
        sha256 = "4598bf5a8b4f5ced82c782899438a7ba695165d47b3bf783ce774e89a8c6e617",
        strip_prefix = "bazel-toolchains-0.27.0",
        url = "https://github.com/bazelbuild/bazel-toolchains/archive/0.27.0.tar.gz",
    )

    #############################################
    # Dependencies for generating documentation #
    #############################################
    # TODO(gregmagolan): update to upstream commit once https://github.com/bazelbuild/rules_sass/pull/87 lands
    http_archive(
        name = "io_bazel_rules_sass",
        sha256 = "1c20d2ddc3d42712543e3b77bceac1bfea072849602569a6fc8b107e6d520ac6",
        strip_prefix = "rules_sass-d033c0f9f7a2c75b73068f6647a5b0cc5070fd90",
        url = "https://github.com/gregmagolan/rules_sass/archive/d033c0f9f7a2c75b73068f6647a5b0cc5070fd90.zip",
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
