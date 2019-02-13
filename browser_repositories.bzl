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
        # Chromium 72.0.3626
        # stable version as per https://www.chromium.org/developers/calendar
        amd64_sha256 =
            "da675fd5e6455fa8e31d80782a78b9eabe6ec7b01be2252b5ada4c1e92ebd724",
        amd64_urls = [
            # Chromium 72.0.3626.0 2018-11-30 612456 snapshot
            # https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Linux_x64/612456/
            "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/612456/chrome-linux.zip",
        ],
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        macos_sha256 =
            "6f97313736f6afd5ed0ebd11cee8f14feee9edb2dc19f2e9a46f4dd92c5b4077",
        macos_urls = [
            # Chromium 72.0.3626.0 2018-11-30 612451 snapshot
            # https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Mac/612451/
            "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/612451/chrome-mac.zip",
        ],
        windows_sha256 =
            "e1ae7fc3135bc5632c740d0e477be64adc0572d1fdfe976d76f34361f2cd469e",
        windows_urls = [
            # Chromium 72.0.3626.0 2018-11-30 612451 snapshot
            # https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=Win_x64/612451/
            "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win_x64/612451/chrome-win.zip",
        ],
    )

    platform_http_file(
        name = "org_chromium_chromedriver",
        # ChromeDriver 2.46: Supports Chrome v71-73
        # http://chromedriver.chromium.org/downloads
        amd64_sha256 =
            "461919e080e19335a34224e2d353b96b07c7d068621aa940f9c136e86d090047",
        amd64_urls = [
            "https://chromedriver.storage.googleapis.com/2.46/chromedriver_linux64.zip",
        ],
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        macos_sha256 =
            "2aa256d17e4b2cc21f888b0e1b9ed211b925bf40f371d369fa0b9fbecf4bc52d",
        macos_urls = [
            "https://chromedriver.storage.googleapis.com/2.46/chromedriver_mac64.zip",
        ],
        windows_sha256 =
            "85a53c6794ea2262a21fa7720158f1434f69e7cd04105fe1be3cb62c59308c37",
        windows_urls = [
            "https://chromedriver.storage.googleapis.com/2.46/chromedriver_win32.zip",
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
