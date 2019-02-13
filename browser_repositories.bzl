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

This function is here temporarily to fix https://github.com/angular/angular/issues/28681.
It will be removed once the browser versions are fixed upstream and we can pull
working versions from rules_webtesting browser_repositories().

TODO(gregmagolan): remove this file once we have working browser versions from rules_webtesting.
"""

load("@io_bazel_rules_webtesting//web/internal:platform_http_file.bzl", "platform_http_file")

def browser_repositories():
    """Load pinned rules_webtesting browser versions."""

    platform_http_file(
        name = "org_chromium_chromium",
        amd64_sha256 =
            "6933d0afce6e17304b62029fbbd246cbe9e130eb0d90d7682d3765d3dbc8e1c8",
        amd64_urls = [
            "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/561732/chrome-linux.zip",
        ],
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        macos_sha256 =
            "084884e91841a923d7b6e81101f0105bbc3b0026f9f6f7a3477f5b313ee89e32",
        macos_urls = [
            "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/561733/chrome-mac.zip",
        ],
        windows_sha256 =
            "d1bb728118c12ea436d8ea07dba980789e7d860aa664dd1fad78bc20e8d9391c",
        windows_urls = [
            "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win_x64/540270/chrome-win32.zip",
        ],
    )

    platform_http_file(
        name = "org_chromium_chromedriver",
        amd64_sha256 =
            "71eafe087900dbca4bc0b354a1d172df48b31a4a502e21f7c7b156d7e76c95c7",
        amd64_urls = [
            "https://chromedriver.storage.googleapis.com/2.41/chromedriver_linux64.zip",
        ],
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        macos_sha256 =
            "fd32a27148f44796a55f5ce3397015c89ebd9f600d9dda2bcaca54575e2497ae",
        macos_urls = [
            "https://chromedriver.storage.googleapis.com/2.41/chromedriver_mac64.zip",
        ],
        windows_sha256 =
            "a8fa028acebef7b931ef9cb093f02865f9f7495e49351f556e919f7be77f072e",
        windows_urls = [
            "https://chromedriver.storage.googleapis.com/2.38/chromedriver_win32.zip",
        ],
    )

    platform_http_file(
        name = "org_mozilla_firefox",
        amd64_sha256 =
            "3a729ddcb1e0f5d63933177a35177ac6172f12edbf9fbbbf45305f49333608de",
        amd64_urls = [
            "https://mirror.bazel.build/ftp.mozilla.org/pub/firefox/releases/61.0.2/linux-x86_64/en-US/firefox-61.0.2.tar.bz2",
            "https://ftp.mozilla.org/pub/firefox/releases/61.0.2/linux-x86_64/en-US/firefox-61.0.2.tar.bz2",
        ],
        licenses = ["reciprocal"],  # MPL 2.0
        macos_sha256 =
            "bf23f659ae34832605dd0576affcca060d1077b7bf7395bc9874f62b84936dc5",
        macos_urls = [
            "https://mirror.bazel.build/ftp.mozilla.org/pub/firefox/releases/61.0.2/mac/en-US/Firefox%2061.0.2.dmg",
            "https://ftp.mozilla.org/pub/firefox/releases/61.0.2/mac/en-US/Firefox%2061.0.2.dmg",
        ],
    )

    platform_http_file(
        name = "org_mozilla_geckodriver",
        amd64_sha256 =
            "c9ae92348cf00aa719be6337a608fae8304691a95668e8e338d92623ba9e0ec6",
        amd64_urls = [
            "https://mirror.bazel.build/github.com/mozilla/geckodriver/releases/download/v0.21.0/geckodriver-v0.21.0-linux64.tar.gz",
            "https://github.com/mozilla/geckodriver/releases/download/v0.21.0/geckodriver-v0.21.0-linux64.tar.gz",
        ],
        licenses = ["reciprocal"],  # MPL 2.0
        macos_sha256 =
            "ce4a3e9d706db94e8760988de1ad562630412fa8cf898819572522be584f01ce",
        macos_urls = [
            "https://mirror.bazel.build/github.com/mozilla/geckodriver/releases/download/v0.21.0/geckodriver-v0.21.0-macos.tar.gz",
            "https://github.com/mozilla/geckodriver/releases/download/v0.21.0/geckodriver-v0.21.0-macos.tar.gz",
        ],
    )
