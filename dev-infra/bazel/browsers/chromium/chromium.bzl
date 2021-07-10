load("//dev-infra/bazel/browsers:browser_archive_repo.bzl", "browser_archive")

"""
  Defines repositories for Chromium that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_chromium_repositories():
    # To update to a newer version of Chromium see instructions in
    # https://github.com/angular/angular/blob/master/dev-infra/bazel/browsers/README.md.

    browser_archive(
        name = "org_chromium_chromium_amd64",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "36759ed6d151645d00a3a015200334edc70188b422eec51bcaa5790c8e906e27",
        # 87.0.4280
        url = "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/812847/chrome-linux.zip",
        named_files = {
            "CHROMIUM": "chrome-linux/chrome",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_macos",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "e10533c84ef57232975d6bde9cd28fd0354371e9556dda85e01178e6dcd56b93",
        # 87.0.4280
        url = "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/812851/chrome-mac.zip",
        named_files = {
            "CHROMIUM": "chrome-mac/Chromium.app/Contents/MacOS/chromium",
        },
    )

    browser_archive(
        name = "org_chromium_chromium_windows",
        licenses = ["notice"],  # BSD 3-clause (maybe more?)
        sha256 = "40d0dec1892d729db2f7d8f27feff762b070a02f04d4e14f4e37b97d6b7c3c8f",
        # 87.0.4280
        url = "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/812822/chrome-win.zip",
        named_files = {
            "CHROMIUM": "chrome-win/chrome.exe",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_amd64",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "d859f8ecb21e26d3ddaf3f229da695bc86512f4e6c9fe32533af7a8b36783ec5",
        # 87.0.4280
        url = "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Linux_x64/812847/chromedriver_linux64.zip",
        named_files = {
            "CHROMEDRIVER": "chromedriver_linux64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_macos",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "aa7a99fa23287725d7108cc07baa94e6f0ef4171ff7b134018387a939a67d93d",
        # 87.0.4280
        url = "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Mac/812851/chromedriver_mac64.zip",
        named_files = {
            "CHROMEDRIVER": "chromedriver_mac64/chromedriver",
        },
    )

    browser_archive(
        name = "org_chromium_chromedriver_windows",
        licenses = ["reciprocal"],  # BSD 3-clause, ICU, MPL 1.1, libpng (BSD/MIT-like), Academic Free License v. 2.0, BSD 2-clause, MIT
        sha256 = "826f2bd0c50b823e7642860ed08cacf69d3756002a71ac30cdd77c68f31d2d24",
        # 87.0.4280
        url = "https://commondatastorage.googleapis.com/chromium-browser-snapshots/Win/812822/chromedriver_win32.zip",
        named_files = {
            "CHROMEDRIVER": "chromedriver_win32/chromedriver.exe",
        },
    )
