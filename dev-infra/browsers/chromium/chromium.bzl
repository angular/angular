load("//dev-infra/browsers:platform_http_file.bzl", "platform_http_file")

"""
  Defines repositories for Chromium that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_chromium_repositories():
    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/angular/blob/master/dev-infra/browsers/README.md.

    platform_http_file(
        name = "org_chromium_chromium_amd64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "0e303931d9c3e065a160f5d31f1178c647f0748fb0b58b1945b84b04fe1c1165",
        # 84.0.4147
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/768968/chrome-linux.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_macos",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "39118c96db1b3fdb0129f434912a329c5ca07d3a1c6c6cda673d3383d83e2f9a",
        # 84.0.4147
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/768968/chrome-mac.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "3429746fa80c917c6f4d5d96aba4e58894b905a2b8392e43ddb470c5ba612d60",
        # 84.0.4147
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/768975/chrome-win.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_amd64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "f6b9852031d185739a2c1816508fe8158eb92782d13e831b8345957ef2506fe8",
        # 84.0.4147
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/768968/chromedriver_linux64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_macos",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "aa0124085146556d5d32ad172670e5dcef79b7429380112ad02898047ba7a8b7",
        # 84.0.4147
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/768968/chromedriver_mac64.zip"],
    )

    platform_http_file(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "c4b04fd263e757d3aa99c596832f2c414f9f00e80d2769590e2b9044072b140e",
        # 84.0.4147
        urls = ["https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/768975/chromedriver_win32.zip"],
    )
