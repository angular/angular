# Copyright 2018 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Package file which defines build_bazel_rules_typescript version in skylark

check_rules_typescript_version can be used in downstream WORKSPACES to check
against a minimum dependent build_bazel_rules_typescript version.
"""

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# This file mirrored from https://raw.githubusercontent.com/bazelbuild/rules_typescript/0.17.0/package.bzl
VERSION = "0.17.0"

def rules_typescript_dependencies():
    """
    Fetch our transitive dependencies.

    If the user wants to get a different version of these, they can just fetch it
    from their WORKSPACE before calling this function, or not call this function at all.
    """

    # TypeScript compiler runs on node.js runtime
    _maybe(
        http_archive,
        name = "build_bazel_rules_nodejs",
        urls = ["https://github.com/bazelbuild/rules_nodejs/archive/0.13.4.zip"],
        strip_prefix = "rules_nodejs-0.13.4",
        sha256 = "a612bfd80b980bf7aa1ef9b24ef3c86a7e82bcd3f8aa92c5ef492472657cc7c8",
    )

    # ts_web_test depends on the web testing rules to provision browsers.
    _maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        urls = ["https://github.com/bazelbuild/rules_webtesting/archive/0.2.1.zip"],
        strip_prefix = "rules_webtesting-0.2.1",
        sha256 = "7d490aadff9b5262e5251fa69427ab2ffd1548422467cb9f9e1d110e2c36f0fa",
    )

    # ts_devserver depends on the Go rules.
    # See https://github.com/bazelbuild/rules_go#setup for the latest version.
    _maybe(
        http_archive,
        name = "io_bazel_rules_go",
        urls = ["https://github.com/bazelbuild/rules_go/releases/download/0.13.0/rules_go-0.13.0.tar.gz"],
        sha256 = "ba79c532ac400cefd1859cbc8a9829346aa69e3b99482cd5a54432092cbc3933",
    )

    # go_repository is defined in bazel_gazelle
    _maybe(
        http_archive,
        name = "bazel_gazelle",
        urls = ["https://github.com/bazelbuild/bazel-gazelle/releases/download/0.13.0/bazel-gazelle-0.13.0.tar.gz"],
        sha256 = "bc653d3e058964a5a26dcad02b6c72d7d63e6bb88d94704990b908a1445b8758",
    )

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
