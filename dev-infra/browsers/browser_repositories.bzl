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

load("@io_bazel_rules_webtesting//web/internal:platform_http_file.bzl", _platform_http_file = "platform_http_file")

def platform_http_file(name, licenses, sha256, urls):
    """Platform spepcific browser repository.

    This works around a dificiency in io_bazel_rules_webtesting platform_http_file in that
    it selects the platform when the repository rule is executed. This limits browsers
    tests to run on the local user platform only. For cross-platform RBE we want a repository
    to be defined per platform so the correct one can be selected.
    """

    _platform_http_file(
        name = name,
        amd64_sha256 = sha256,
        amd64_urls = urls,
        licenses = licenses,
        macos_sha256 = sha256,
        macos_urls = urls,
        windows_sha256 = sha256,
        windows_urls = urls,
    )

def browser_repositories():
    """Load pinned rules_webtesting browser versions."""

    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/angular/blob/master/dev-infra/browsers/README.md.

    platform_http_file(
        name = "org_chromium_chromium_amd64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "2cfd74ee58c79d8b7aada05c899a930967e2fd8bb0186582cde02c7340863f64",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/756066/chrome-linux.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_macos",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "b841ec5ad03b08422d97593fc719f1c5b038703388ad65e6cd8cc8272d58958c",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/756053/chrome-mac.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "4683d7ac88dfec4b98d1da3012ecc8e42cc8c1a560a7b95589ad4cc96bf90fcb",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/756065/chrome-win.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_amd64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "95dded16000b82e31445361da7d251ed707e027a4b61e9a3ec5fbd1cc2f62bb1",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/756066/chromedriver_linux64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_macos",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "17260e9b2222b0c905a1861285210192baef830f4281778903e7cebb8db683cc",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/756053/chromedriver_mac64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "de1423b2d69f96e451e902d686e8d471610d786c345a8de59dd1a5a436e45fc2",
        # 83.0.4103
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/756065/chromedriver_win32.zip"],
    )
