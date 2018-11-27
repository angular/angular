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

# This file mirrored from https://raw.githubusercontent.com/bazelbuild/rules_typescript/0.20.3/package.bzl
VERSION = "0.20.3"

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
        urls = ["https://github.com/bazelbuild/rules_nodejs/archive/0.15.3.zip"],
        strip_prefix = "rules_nodejs-0.15.3",
    )

    # ts_web_test depends on the web testing rules to provision browsers.
    _maybe(
        http_archive,
        name = "io_bazel_rules_webtesting",
        urls = ["https://github.com/bazelbuild/rules_webtesting/archive/111d792b9a5b17f87b6e177e274dbbee46094791.zip"],
        strip_prefix = "rules_webtesting-111d792b9a5b17f87b6e177e274dbbee46094791",
        sha256 = "a13af63e928c34eff428d47d31bafeec4e38ee9b6940e70bf2c9cd47184c5c16",
    )

    # ts_devserver depends on the Go rules.
    # See https://github.com/bazelbuild/rules_go#setup for the latest version.
    _maybe(
        http_archive,
        name = "io_bazel_rules_go",
        urls = ["https://github.com/bazelbuild/rules_go/archive/cbc1e32fba771845305f15e341fa26595d4a136d.zip"],
        strip_prefix = "rules_go-cbc1e32fba771845305f15e341fa26595d4a136d",
        sha256 = "d02b1d8d11fb67fb1e451645256e58a1542170eedd6e2ba160c8540c96f659da",
    )

    # go_repository is defined in bazel_gazelle
    _maybe(
        http_archive,
        name = "bazel_gazelle",
        urls = ["https://github.com/bazelbuild/bazel-gazelle/archive/109bcfd6880aac2517a1a2d48987226da6337e11.zip"],
        strip_prefix = "bazel-gazelle-109bcfd6880aac2517a1a2d48987226da6337e11",
        sha256 = "8f80ce0f7a6f8a3fee1fb863c9a23e1de99d678c1cf3c6f0a128f3b883168208",
    )

    # ts_auto_deps depends on com_github_bazelbuild_buildtools
    _maybe(
        http_archive,
        name = "com_github_bazelbuild_buildtools",
        url = "https://github.com/bazelbuild/buildtools/archive/0.12.0.zip",
        strip_prefix = "buildtools-0.12.0",
        sha256 = "ec495cbd19238c9dc488fd65ca1fee56dcb1a8d6d56ee69a49f2ebe69826c261",
    )

    ###############################################
    # Repeat the dependencies of rules_nodejs here!
    # We can't load() from rules_nodejs yet, because we've only just fetched it.
    # But we also don't want to make users load and call the rules_nodejs_dependencies
    # function because we can do that for them, mostly hiding the transitive dependency.
    _maybe(
        http_archive,
        name = "bazel_skylib",
        url = "https://github.com/bazelbuild/bazel-skylib/archive/0.5.0.zip",
        strip_prefix = "bazel-skylib-0.5.0",
        sha256 = "ca4e3b8e4da9266c3a9101c8f4704fe2e20eb5625b2a6a7d2d7d45e3dd4efffd",
    )

def _maybe(repo_rule, name, **kwargs):
    if name not in native.existing_rules():
        repo_rule(name = name, **kwargs)
