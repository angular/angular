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

"""Pinned browser versions.

This function is here to make browser repositories work with cross-platform RBE.
Unlike the rules_webtesting browser_repositories, this function defines
separate repositories for each platform
"""

load("//dev-infra/browsers/chromium:chromium.bzl", "define_chromium_repositories")
load("//dev-infra/browsers/firefox:firefox.bzl", "define_firefox_repositories")

def browser_repositories():
    """Load pinned rules_webtesting browser versions."""

    define_chromium_repositories()
    define_firefox_repositories()
